// Lanyard API for Live Discord Status
function fetchDiscordStatus() {
    fetch('https://api.lanyard.rest/v1/users/521882529092075530')
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                const status = data.data.discord_status;
                const dot = document.getElementById('discord-status-dot');
                const text = document.getElementById('discord-status-text');
                
                // Reset base classes
                dot.className = 'w-3 h-3 rounded-full';

                if (status === 'online') {
                    dot.classList.add('bg-green-500', 'animate-pulse', 'shadow-[0_0_8px_#22c55e]');
                    text.textContent = 'USER_ONLINE';
                } else if (status === 'idle') {
                    dot.classList.add('bg-yellow-500', 'animate-pulse', 'shadow-[0_0_8px_#eab308]');
                    text.textContent = 'USER_IDLE';
                } else if (status === 'dnd') {
                    dot.classList.add('bg-red-500', 'animate-pulse', 'shadow-[0_0_8px_#ef4444]');
                    text.textContent = 'USER_DND';
                } else {
                    // Offline or invisible
                    dot.classList.add('bg-slate-500', 'shadow-[0_0_8px_#64748b]');
                    text.textContent = 'USER_OFFLINE';
                }
            }
        })
        .catch(err => console.error("Error fetching Discord status:", err));
}

// Optimized clock logic - strictly aligns to exact second changes
function updateClock() {
    const now = new Date();
    const localTime = now.toLocaleTimeString('en-GB', { hour12: false });
    const utcTime = now.toLocaleTimeString('en-GB', { hour12: false, timeZone: 'UTC' });
    document.getElementById('clock').textContent = `${localTime} | ${utcTime}`;

    // Calculate precise milliseconds until the next integer second
    const msToNextSecond = 1000 - now.getMilliseconds();
    setTimeout(updateClock, msToNextSecond);
}

// Boot Sequence
window.addEventListener('DOMContentLoaded', () => {
    // Fetch status immediately on load
    fetchDiscordStatus();
    // Polling interval throttled to exactly 30,000ms (30 seconds)
    setInterval(fetchDiscordStatus, 30000);

    setTimeout(() => {
        const status = document.getElementById('boot-status');
        status.textContent = 'ACCESS GRANTED';
        status.classList.remove('text-cr-text');
        status.classList.add('text-cr-red');
        
        setTimeout(() => {
            document.getElementById('boot-screen').style.display = 'none';
            document.getElementById('main-container').classList.add('crt-reveal');
        }, 500);

    }, 1500);

    // Initialize precision clock
    updateClock();
});

// Tab Switching Logic
function switchTab(tabId) {
    closeModal(); 
    
    const vid = document.getElementById('main-video');
    if (vid) vid.pause(); 
    
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(t => t.classList.remove('active'));
    
    const sections = document.querySelectorAll('.dossier-section');
    sections.forEach(s => {
        s.classList.remove('active');
        s.classList.remove('animate-inner-crt');
    });
    
    const activeTab = Array.from(tabs).find(t => t.textContent.trim().toLowerCase() === tabId.toLowerCase());
    if (activeTab) activeTab.classList.add('active');
    
    const targetSection = document.getElementById(tabId);
    if (targetSection) {
        targetSection.classList.add('active');
        // Trigger inner animation
        void targetSection.offsetWidth; 
        targetSection.classList.add('animate-inner-crt');
    }

    if (tabId === 'videography' && vid) {
        vid.play().catch(e => console.log('Autoplay prevented by browser'));
    }
}

// Photography Logic
function openPhoto(src, metaData) {
    const modal = document.getElementById('photo-modal');
    const content = document.getElementById('modal-content');
    
    document.getElementById('modal-img').src = src;
    document.getElementById('modal-meta').innerHTML = metaData;
    
    modal.style.display = 'flex';
    
    // Trigger animation
    content.classList.remove('modal-expand');
    void content.offsetWidth;
    content.classList.add('modal-expand');
}

function closeModal() {
    document.getElementById('photo-modal').style.display = 'none';
}

// Videography Logic
const video = document.getElementById('main-video');
const playBtn = document.getElementById('vid-play-btn');
const slider = document.getElementById('vid-slider');
const timecode = document.getElementById('vid-timecode');

function switchVideo(src, name) {
    video.src = src;
    document.getElementById('vid-name').textContent = name;
    video.play();
    playBtn.textContent = '[PAUSE]';
}

if(video) {
    playBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playBtn.textContent = '[PAUSE]';
        } else {
            video.pause();
            playBtn.textContent = '[PLAY]';
        }
    });

    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        slider.value = isNaN(percent) ? 0 : percent;

        const t = video.currentTime;
        const m = Math.floor(t / 60).toString().padStart(2, '0');
        const s = Math.floor(t % 60).toString().padStart(2, '0');
        const ms = Math.floor((t % 1) * 100).toString().padStart(2, '0');
        timecode.textContent = `00:${m}:${s}:${ms}`;
    });

    slider.addEventListener('input', (e) => {
        const time = (e.target.value / 100) * video.duration;
        video.currentTime = time;
    });
}