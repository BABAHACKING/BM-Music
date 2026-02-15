// Initialize Supabase Client for Frontend
// Using the CDN loaded script from @supabase/supabase-js

const SUPABASE_URL = 'https://clkiwvcxyfrbajewbezg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Qx0CM4WGREXRGBJRzFUOlg_dYpazNSr';

// Universal Diagnostic Console Injection
(function () {
    const debugDiv = document.createElement('div');
    debugDiv.id = 'baba-debug';
    debugDiv.style = "position:fixed;bottom:100px;right:20px;background:rgba(0,0,0,0.85);color:#1DB954;padding:12px;border-radius:12px;font-family:monospace;font-size:11px;z-index:10000;max-width:300px;display:none;pointer-events:none;border:1px solid #1DB954;box-shadow:0 8px 32px rgba(0,0,0,0.5);backdrop-filter:blur(8px);";
    debugDiv.innerHTML = '<div style="font-weight:bold;margin-bottom:8px;border-bottom:1px solid #1DB954;padding-bottom:4px;">💿 Baba Cloud Sync</div><div id="debug-msgs"></div>';
    document.body.appendChild(debugDiv);

    const msgs = debugDiv.querySelector('#debug-msgs');
    const addMsg = (m, c) => {
        debugDiv.style.display = 'block';
        const d = document.createElement('div');
        d.style.color = c || '#1DB954';
        d.style.marginBottom = '4px';
        d.innerText = m;
        msgs.appendChild(d);
        if (msgs.children.length > 6) msgs.removeChild(msgs.children[0]);
    };

    window.babaLog = (m) => addMsg('✅ ' + m);
    window.babaError = (m) => addMsg('❌ ' + m, '#ff4444');

    const oErr = console.error;
    console.error = (...a) => {
        oErr(...a);
        const txt = a.join(' ');
        if (txt.includes('Supabase') || txt.includes('Playback') || txt.includes('Audio')) window.babaError(txt);
    };
})();

if (typeof supabase === 'undefined') {
    window.babaError('Supabase library NOT loaded! Check CDN.');
} else {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.babaLog('Supabase Connected 🚀');
}

// Helper to get current session
async function getSession() {
    if (!window.supabaseClient) {
        console.warn('Supabase client not ready, skipping session check.');
        return null;
    }
    try {
        const { data, error } = await window.supabaseClient.auth.getSession();
        if (error) {
            console.error('Error getting session:', error);
            return null;
        }
        return data.session;
    } catch (e) {
        console.warn('Session check failed:', e.message);
        return null;
    }
}

// Helper to sign out
async function signOut() {
    const { error } = await window.supabaseClient.auth.signOut();
    if (error) console.error('Error signing out:', error);
    // Clear localStorage fallback
    localStorage.removeItem('babaLoggedIn');
    window.location.reload();
}
