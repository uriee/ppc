function appNavToCreate() {
    document.getElementById('app-welcome-page').style.display = 'none';
    document.getElementById('app-join-page').style.display = 'none';
    document.getElementById('app-create-page').style.display = 'block';
} 

function appNavToJoin() {
    document.getElementById('app-welcome-page').style.display = 'none';
    document.getElementById('app-create-page').style.display = 'none';
    document.getElementById('app-join-page').style.display = 'block';
} 

function appNavToWelcome() {
    document.getElementById('app-join-page').style.display = 'none';
    document.getElementById('app-create-page').style.display = 'none';
    document.getElementById('app-welcome-page').style.display = 'block';
} 

function appCreateMeeting() {

    var name = document.getElementById('create-meeting-name-input').value;
    var charge = document.getElementById('create-meeting-charge-input').value;
    var duration = document.getElementById('create-meeting-duration-input').value;

    window.alert(name + charge + duration);
}

function appJoinMeeting() {

    var name = document.getElementById('join-meeting-name-input').value;
    var charge = document.getElementById('join-meeting-pay-input').value;
    var duration = document.getElementById('join-meeting-id-input').value;

    window.alert(name + charge + duration);
}

