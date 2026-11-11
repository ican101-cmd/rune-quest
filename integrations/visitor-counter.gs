// Google Apps Script. Add the "Google Analytics Data API" advanced service.
// Set the numeric GA4 property ID below, then run setupVisitorCounter once.
const GA4_PROPERTY_ID = '';
const VISITOR_SNAPSHOT_KEY = 'public-visitor-count-v1';

function refreshVisitorCounter() {
  if (!/^\d+$/.test(GA4_PROPERTY_ID)) throw new Error('請先填入數字型 GA4 資源 ID（不是 G- 評估 ID）');
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    const report = AnalyticsData.Properties.runReport({
      dateRanges: [{startDate: '2020-01-01', endDate: 'today'}],
      metrics: [{name: 'totalUsers'}],
      dimensionFilter: {filter: {fieldName: 'pageLocation', stringFilter: {
        matchType: 'BEGINS_WITH', value: 'https://ican101-cmd.github.io/rune-quest/'
      }}}
    }, 'properties/' + GA4_PROPERTY_ID);
    if (!report.metricHeaders?.some(h => h.name === 'totalUsers')) throw new Error('統計回應缺少總使用者人數欄位');
    const raw = report.rows?.[0]?.metricValues?.[0]?.value;
    const count = raw === undefined && !report.rows?.length ? 0 : Number(raw);
    if (!Number.isSafeInteger(count) || count < 0) throw new Error('統計回應不是有效人數');
    // Query distinct users over the entire period, never sum daily users.
    const payload = {version: 1, totalUsers: count, updatedAt: new Date().toISOString()};
    PropertiesService.getScriptProperties().setProperty(VISITOR_SNAPSHOT_KEY, JSON.stringify(payload));
  } finally { lock.releaseLock(); }
}

function setupVisitorCounter() {
  refreshVisitorCounter();
  ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === 'refreshVisitorCounter').forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('refreshVisitorCounter').timeBased().everyHours(1).create();
}

function doGet() {
  // Public requests read only a cached aggregate: no report access per visitor.
  // The fixed JSONP callback avoids cross-origin redirects; no user-supplied code.
  let result = {version: 1, available: false};
  try {
    const saved = JSON.parse(PropertiesService.getScriptProperties().getProperty(VISITOR_SNAPSHOT_KEY) || 'null');
    if (saved && Number.isSafeInteger(saved.totalUsers) && saved.totalUsers >= 0 && typeof saved.updatedAt === 'string') result = saved;
  } catch (e) {}
  return ContentService.createTextOutput('window.runeQuestVisitorCount(' + JSON.stringify(result) + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
}
