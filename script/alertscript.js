document.getElementById("comingSoonAbout").addEventListener("click", function () {
    alert("Coming Soon...")
});

document.getElementById("comingSoonSer").addEventListener("click", function () {
    alert("Coming Soon...")
});

document.getElementById("comingSoonCont").addEventListener("click", function () {
    alert("Coming Soon...")
});


function downloadSong(songName) {

    document.getElementById("alert-message-head").innerHTML = `
        <div class="alert-message-head-icon-1">
        <img width="70" height="70" src="https://img.icons8.com/arcade/64/high-priority.png"
            alt="high-priority" />
    </div> <b>Unable to Download Item!</b>`
    document.getElementById("download-not-working").style.borderImageSource = "none";
    document.getElementById("download-not-working").style.borderStyle = "solid";
    document.getElementById("download-not-working").style.borderWidth = "0px"
    document.getElementById("download-not-working").style.borderImageSlice = "0";
    document.getElementById("download-not-working").style.borderImageRepeat = "round";
    document.getElementById("download-not-working").style.color = "black";
    document.getElementById("download-not-working").style.width = "90%";
    document.getElementById("download-not-working").style.background = "rgba(190, 190, 190, 0.5)";
    document.getElementById("alert-message-head").style.background = "rgb(160, 55, 55)";
    document.getElementById("alert-message-head").style.borderRadius = "1.1rem 1.1rem 0.3rem 0.3rem";
    document.getElementById("alert-message-head").style.color = "white";
    document.getElementById("pt-alert-message-head").style.justifyContent = "center";
    document.getElementById("pt-alert-message-head").style.display = "flex";
    // Set dynamic song name in the alert
    document.getElementById("alert-message").innerHTML = `Download not available for the song <span class="alter-msg-body-song-name">${songName}</span> right now.<br>Stay tuned!<br>We'll notify you as soon as it's ready.`;
    document.getElementById("alert-close-btn").style.background = "";
    document.getElementById("team-name").style.color = "";
    document.getElementById("alert-close-btn").innerHTML = `Understood
                    <div class="alert-close-btn-icon" id="alert-close-btn-icon">
                        <img width="100" height="100" src="https://img.icons8.com/ios-filled/100/FFFFFF/facebook-like.png"
                            alt="facebook-like" />
                    </div>`;

    // Show the alert and overlay with animation
    let alertBox = document.getElementById("download-not-working");
    let overlay = document.getElementById("alert-overlay");

    // Lock body
    document.body.classList.add('body-lock');
    document.body.style.top = `-${scrollPosition}px`;

    // Disable touch actions
    document.body.style.touchAction = 'none';

    overlay.style.display = "block";
    setTimeout(() => {
        overlay.style.opacity = "1";
    }, 10);

    alertBox.style.display = "block";
    setTimeout(() => {
        alertBox.style.opacity = "1";
        alertBox.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);

    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Lock body
    document.body.classList.add('body-lock');
    document.body.style.top = `-${scrollPosition}px`;

    // Disable touch actions
    document.body.style.touchAction = 'none';
    list.innerHTML = '';

};

function closeDownloadAlert() {
    let alertBox = document.getElementById("download-not-working");
    let overlay = document.getElementById("alert-overlay");

    // Fade out animation
    alertBox.style.opacity = "0";
    alertBox.style.transform = "translate(-50%, -50%) scale(0.8)";
    overlay.style.opacity = "0";

    // Hide after animation completes
    setTimeout(() => {
        alertBox.style.display = "none";
        overlay.style.display = "none";
    }, 300);

    document.body.classList.remove('body-lock');
    document.body.style.touchAction = '';

    // Restore scroll position
    window.scrollTo(0, scrollPosition);
    document.body.style.top = '';

};


function siteUnderConstruction(songName) {

    document.getElementById("alert-message-head").innerHTML = `
                <div class="alert-message-head-icon-1">
                <img width="70" height="70" src="https://img.icons8.com/ios-filled/100/road-worker.png"
                    alt="high-priority" />
            </div> <b>Site Under Construction!</b>`
    document.getElementById("download-not-working").style.borderImageSource = "repeating-linear-gradient(-45deg, yellow 0px, yellow 10px, black 10px, black 20px)";
    document.getElementById("download-not-working").style.borderStyle = "solid";
    document.getElementById("download-not-working").style.borderWidth = "10px"
    document.getElementById("download-not-working").style.borderImageSlice = "10";
    document.getElementById("download-not-working").style.borderImageRepeat = "round";
    document.getElementById("download-not-working").style.color = "black";
    document.getElementById("alert-message-head").style.color = "black";
    document.getElementById("download-not-working").style.width = "80%";
    document.getElementById("download-not-working").style.background = "rgb(255, 255, 0)"
    document.getElementById("alert-message-head").style.background = "rgb(255, 255, 0)";
    document.getElementById("alert-message-head").style.borderRadius = "0.3rem";
    document.getElementById("pt-alert-message-head").style.justifyContent = "center";
    document.getElementById("pt-alert-message-head").style.display = "flex";



    // Set dynamic song name in the alert
    document.getElementById("alert-message").innerHTML = `
        <div class="Site-under-const-head-head"><img width="48" height="48" src="https://img.icons8.com/emoji/48/party-popper.png" alt="party-popper"/> Rythmify is Getting a Makeover! <img width="48" height="48" src="https://img.icons8.com/emoji/48/party-popper.png" alt="party-popper"/></div><br>
            <div class="Site-under-const-head-head-hey">Hey there! <img width="64" height="64" src="https://img.icons8.com/external-ddara-flat-ddara/64/external-student-boy-school-hello-hand-gesture-greeting-user-avatar-ddara-flat-ddara.png" alt="external-student-boy-school-hello-hand-gesture-greeting-user-avatar-ddara-flat-ddara"/> We’re thrilled to let you know that something amazing is on the way! 🚀 Our team is hard at work upgrading and fine-tuning everything to bring you a better, faster, and more exciting experience.</div><br>

            What This Means for You:<br>
            <div class="Site-under-const-point-01"><img width="48" height="48" src="https://img.icons8.com/color/48/pointing-with-finger.png" alt="pointing-with-finger"/> Some features might be <b>temporarily unavailable</b>.</div><br>
            <div class="Site-under-const-point-01"><img width="48" height="48" src="https://img.icons8.com/color/48/pointing-with-finger.png" alt="pointing-with-finger"/> A few sections are <b>still under construction</b> (but we promise they’ll be worth the wait!).</div><br>
            <div class="Site-under-const-point-01"><img width="48" height="48" src="https://img.icons8.com/color/48/pointing-with-finger.png" alt="pointing-with-finger"/> You may notice <b>design changes and improvements</b> as we test and refine new features.</div><br>
            <div class="Site-under-const-point-01"><img width="48" height="48" src="https://img.icons8.com/color/48/pointing-with-finger.png" alt="pointing-with-finger"/> There could be <b>occasional maintenance downtime</b>, but we’re working to keep it minimal.</div><br>
            <div></div><br>
            <div class="site-under-const-para-01">We truly appreciate your patience and support during this process. 💛 Your feedback and enthusiasm mean the world to us, and we can’t wait to unveil the final version soon!<br>
            <div></div><br>
            Stay Connected!<br>
            🔔 Follow us for updates and sneak peeks of what’s coming next!<br>
            <div></div><br>
            💡 If you have any questions or suggestions, feel free to reach out—we’d love to hear from you!<br>
            <div></div>
            Thank you for being part of our journey! Exciting things are just around the corner! 🎊
            </div>
    `;

    document.getElementById("alert-close-btn").style.background = "black";
    document.getElementById("alert-close-btn").innerHTML = `Visit Website
    <div class="site-under-const-goto">
    <img width="64" height="64" src="https://img.icons8.com/sf-black/64/FFFFFF/walking.png" alt="walking"/>
    </div>`;
    
    document.getElementById("team-name").style.color = "black";

    // Show the alert and overlay with animation
    let alertBox = document.getElementById("download-not-working");
    let overlay = document.getElementById("alert-overlay");

    overlay.style.display = "block";
    setTimeout(() => {
        overlay.style.opacity = "1";
    }, 10);

    alertBox.style.display = "block";
    setTimeout(() => {
        alertBox.style.opacity = "1";
        alertBox.style.transform = "translate(-50%, -50%) scale(1)";
    }, 10);

    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Lock body
    document.body.classList.add('body-lock');
    document.body.style.top = `-${scrollPosition}px`;

    // Disable touch actions
    document.body.style.touchAction = 'none';
    list.innerHTML = '';
};

setTimeout(siteUnderConstruction, 1000);
