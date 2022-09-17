const RENDER_EVENT = 'render_todoapps';
const DATA_AL_KR = 'DATA_AL_KR';
const RESULT_RANK = 'RESULT_RANK';
const SAVED_EVENT = 'save_data';

let tempAlt = [];
let alternatifs = [];
let hasilAlt = [];
let normalisasi = [];

function isStorageExist(){
    if(typeof (Storage) !== undefined) return true;

    alert('Storage tidaj tersedia');
    return false;
}


document.addEventListener('DOMContentLoaded', function() {
    const submitAlt = document.getElementById('form-alt');
    submitAlt.addEventListener('submit', function(event) {
        event.preventDefault();
          addAlternatif(); 
          saveLocalDataAlt();
    });
    loadDataAlt();
    document.addEventListener(SAVED_EVENT, function(){
        loadDataAlt();
    });
});

const resultNormalis = document.getElementById('hitung');
    resultNormalis.addEventListener('click', function(event) {
        event.preventDefault();
        loadDataAlt();
        if(alternatifs.length > 1){
            hitungAlternatif();
            if(normalisasi.length > 1){
                resultNormalis.setAttribute('style', 'display:none;');
            }
        }
        else {
            alert('Harap masukan minimal 2 data yang ingin di proses');
        }
    })

function addAlternatif() {
    const alternatif = document.getElementById('alternatif').value;
    const criteria1 = document.getElementById('criteria1').value;
    const criteria2 = document.getElementById('criteria2').value;
    const criteria3 = document.getElementById('criteria3').value;
    const criteria4 = document.getElementById('criteria4').value;
    const criteria5 = document.getElementById('criteria5').value;

    const generatedID = generateId();
    const alternatifArray = generateAlternatif(generatedID, alternatif, criteria1, criteria2, criteria3, criteria4, criteria5 );
    alternatifs.push(alternatifArray);
    document.dispatchEvent(new Event(RENDER_EVENT));
   
}
function generateId() {
    return +new Date();
}
function alternatifId(id) {
    for(const TodoItem of alternatifs){
        if(TodoItem.id === id){
            return TodoItem;
        }
    }
    return null;
}
function generateAlternatif(id, alternatif, criteria1, criteria2, criteria3, criteria4, criteria5) {
    return {
        id,
        alternatif,
        criteria1,
        criteria2,
        criteria3,
        criteria4,
        criteria5
    }
}

function findAltIndex(alternatiId){
    for(const index in alternatifs){
        if(alternatifs[index].id === alternatiId){
            return index;
        }
    }
    return -1;
}

function deleteAlternatif(alternatiId) {
    const targetId = findAltIndex(alternatiId);
    if(targetId === -1) return;

    alternatifs.splice(targetId, 1);
    saveLocalDataAlt();
    document.dispatchEvent(new Event(RENDER_EVENT));
}
function makeAlternatif(alternatifArray) {
    let row = document.createElement('tr');
    for (let i=0; i < alternatifs.length; i++) {
        row.innerHTML = "<td>" + alternatifArray.alternatif + "</td>";
        row.innerHTML += "<td>" + alternatifArray.criteria1 + "</td>";
        row.innerHTML += "<td>" + alternatifArray.criteria2 + "</td>";
        row.innerHTML += "<td>" + alternatifArray.criteria3 + "</td>";
        row.innerHTML += "<td>" + alternatifArray.criteria4 + "</td>";
        row.innerHTML += "<td>" + alternatifArray.criteria5 + "</td>";
        row.innerHTML += "<td><button id='buttondelete' onclick='deleteAlternatif("+alternatifArray.id+")'>Hapus</button></td>";
    }
    return row;
}
function resultRank(s){
    let rows = document.createElement('tr');
    for (let i=0; i < normalisasi.length; i++) {
        rows.innerHTML = "<td>" + s.alternatif + "</td>";
        rows.innerHTML += "<td>" + s.vektor + "</td>";
        rows.innerHTML += "<td>" + s.normalis + "</td>";
    }
    return rows;
}
document.addEventListener(RENDER_EVENT, function() {   
    const div = document.getElementById('resultAlternatif');
    div.innerHTML = '';

        for(const item of alternatifs){
            const todoElement = makeAlternatif(item);
            div.append(todoElement);   
        }
});
document.addEventListener(RENDER_EVENT, function() {   
    const divs = document.getElementById('resultNormalisasi');
    divs.innerHTML = '';

        for(const item of normalisasi){
            const normalisH = resultRank(item);
            divs.append(normalisH);   
        }
        desCendingRank();
});
function desCendingRank(){
    normalisasi.sort((a,b) => b.normalis - a.normalis);
    document.dispatchEvent(new Event(RENDER_EVENT));
}
 

function hitungAlternatif(){ 
    let result = [];
    for (const vektorId of alternatifs){
        result = {
            id : vektorId.id, 
            alternatif : vektorId.alternatif,
            vektor : (vektorId.criteria1 ** 0.235) * (vektorId.criteria2 ** -0.294) * (vektorId.criteria3 ** 0.117) * (vektorId.criteria4 ** 0.176) * (vektorId.criteria5 ** -0.176) 
        };
        hasilAlt.push(result); 
    }
    
        hitungVektor();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function hitungVektor(){
    var total = 0;
        for(let i= 0; i < hasilAlt.length; i++){
            total += hasilAlt[i].vektor;
         };
         total = total;
         let results = [];
         
         for (const vektorId of hasilAlt){
             results = {
                 id : vektorId.id, 
                 vektor : vektorId.vektor, 
                 alternatif : vektorId.alternatif,
                 normalis :  vektorId.vektor / total,
             };
             normalisasi.push(results);
            }

    document.dispatchEvent(new Event(RENDER_EVENT));
}

function findTodo(alternatifId){
    for(const TodoItem of alternatifs){
        if(TodoItem.id == alternatifId){
            return TodoItem;
        }
    }
    return null;
}
function hitungNormalis() {
    var total = 0;
    for(let i= 0; i < hasilAlt.length; i++){
       total += hasilAlt[i].vektor;
    }
    return total;
}
function saveLocalDataAlt() {
    const jsonStringify = JSON.stringify(alternatifs);
    localStorage.setItem(DATA_AL_KR, jsonStringify);
    document.dispatchEvent(new Event(SAVED_EVENT));
}
function loadDataAlt() {
    if(!isStorageExist()) return;

    const serializeData = localStorage.getItem(DATA_AL_KR);
    const dataAltSave = JSON.parse(serializeData);

    if(dataAltSave == null) return;

    alternatifs = [];
    tempAlt = [];
    dataAltSave.map((alternatifArray) => {
        alternatifs.push(alternatifArray);
        tempAlt.push(alternatifArray);
    });
    document.dispatchEvent(new Event(RENDER_EVENT));
}