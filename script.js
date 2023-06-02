var iframeEl = document.getElementById('api-frame');
var optionsEl = document.querySelector('.options');
var version = '1.12.1';
var uid = '32b1d264200f4991b43e855d5da24401';
var iframe = document.getElementById('api-frame');
var client = new window.Sketchfab(version, iframe);
var error = function error() {
    console.error('Sketchfab API error');
};
var controller;
iframe.style.visibility = "hidden";

var defaults = {
    "Collar": 267,
    "Back": 197,
    "Pocket": 176,
    "Placket": 117,
    "Sleeve": 77
}
var restValues = {
    "Sleeve": [24, 77],
    "Placket": [91, 117, 162],
    "Pocket": [176],
    "Back": [225, 197],
    "Collar": [267, 350, 426, 464, 305]
}
let videoTextureIds = [];
let shirtUrl = "";
let loopCount = 20;

const setShirtUrl = ({ target: { value } }) => shirtUrl = value;

const addTextureToModel = () => {
    if (shirtUrl.length > 0) {
        for (let i = 0; i <= loopCount; i++) {
            controller.addVideoTexture(
                shirtUrl, { mute: true, loop: true },
                (err, textureId) => {
                    if (err) {
                        window.console.log('video texture load error');
                    } else {
                        videoTextureIds.push(textureId);
                        if (i == loopCount) {
                            applyTexture();
                        }
                    }
                }
            );
        }
    }
};
const applyTexture = () => {
    controller.getMaterialList((err, materials) => {
        materials.forEach((material, index) => {
            material.channels['AlbedoPBR'].factor = 1;
            material.channels['AlbedoPBR'].texture = {
                uid: videoTextureIds[index]
            };
            controller.setMaterial(material);
        });
    });
    setTimeout(() => {
        videoTextureIds = [];
    }, 2000);
    document.getElementById("shirtInput").value = "";
}

// Collor: Chinese,
var success = function success(api) {
    api.start(function () {
        api.addEventListener('viewerready', function () {

            api.getSceneGraph(function (err, result) {
                if (err) {
                    console.log('Error getting nodes');
                    return;
                }
                // get the id from that log
                console.log(result);
            });
            controller = api;
            initList();
        });
        var pbmesh = document.getElementById('percent');
        var progress = document.getElementById('progress');
        api.addEventListener('modelLoadProgress', function (eventData) {
            var percent = Math.floor(eventData.progress * 100);
            pbmesh.innerText = "Loading : " + percent + '%';
            progress.style.background = `conic-gradient(#000 ${percent * 3.6}deg, #ededed 0deg)`;
            if (percent == 100) {
                iframe.style.visibility = "visible";
                progress.style.visibility = "hidden";
                pbmesh.style.display = "none";
            }
        });
    });
};
function initList() {
    Object.keys(defaults).forEach(i => {
        var value = defaults[i];
        // console.log(i, value, restValues[i]);
        toggleItem(value, restValues[i]);
    });
}

// toggleItem(284, [124, 531, 624])
function toggleItem(instanceId, instanceIdList) {
    controller.show(instanceId);
    instanceIdList.filter(i => i !== instanceId).map(item => {
        controller.hide(item);
    });
}
client.init(uid, {
    success,
    error,
    preload: 0,
    autostart: 1,
    ui_infos: 0,
    ui_stop: 0,
    ui_color: 'FF0000',
    ui_controls: 0,
    ui_loading: 0
});