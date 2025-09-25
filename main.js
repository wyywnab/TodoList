var addTagListEle;
var textDescriptionEle;
var deadlineDatetimeEle;
var submitButtonEle;
var addCardTitle;
var cancelButtonEle;
var textFilterEle;
var addTagInputEle;

const tagColorSeletced = "#B0BEC5"
const tagColorNotSeletced = "#ECEFF1"

var tagsFiltered = "";
var keywordFiltered = "";

function addTag(){
    var inputText = addTagInputEle.value;
    inputText = inputText.replace(",","");
    if (inputText == "") return;
    var currentTagList = localStorage.getItem("tags");
    var list = [];
    if (!!currentTagList){
        list = JSON.parse(currentTagList);
    }
    for (var i = 0; i < list.length; i++){
        if (list[i] == inputText){
            return;
        }
    }
    list.push(inputText);
    localStorage.setItem("tags", JSON.stringify(list));

    refreshTagList();
}
function refreshTagList(){
    var addTagListEles = this.document.querySelectorAll(".tag-list");
    for (var j = 0; j < addTagListEles.length; j++){
        addTagListEles[j].innerHTML = "";
    }

    var currentTagList = localStorage.getItem("tags");
    var list = [];
    if (!!currentTagList){
        list = JSON.parse(currentTagList);
    }
    //var tagEleList = [];
    for (var i = 0; i < list.length; i++){
        for (var j = 0; j < addTagListEles.length; j++){
            var tempEle = this.document.createElement("div");
            tempEle.innerHTML = list[i];
            tempEle.setAttribute("data-tag-name", list[i]);
            tempEle.setAttribute("data-selected", false);
            tempEle.addEventListener("click", function(){
                if (this.getAttribute("data-selected") == "true"){
                    this.setAttribute("data-selected", false);
                    this.style.backgroundColor = tagColorNotSeletced;
                } else {
                    this.setAttribute("data-selected", true);
                    this.style.backgroundColor = tagColorSeletced;
                }

                if (this.parentElement.getAttribute("id") == "tag-list-filter"){
                    tagsFiltered = getTags(document.querySelector("#tag-list-filter"));
                    refreshTodoList(keywordFiltered, tagsFiltered);
                }
            });
            addTagListEles[j].appendChild(tempEle);
            var removeEle = this.document.createElement("a");
            removeEle.innerHTML = `<img class="remove-tag" src="icon/close_small_24dp_434343_FILL0_wght400_GRAD0_opsz24.svg">`;
            removeEle.setAttribute("data-tag-name", list[i]);
            removeEle.addEventListener("click", function(){
                var allTags = JSON.parse(localStorage.getItem("tags"));
                var targetTag = this.getAttribute("data-tag-name");
                console.log(targetTag);
                var newTags = allTags.filter(item => item !== targetTag);
                localStorage.setItem("tags", JSON.stringify(newTags));
                refreshTagList();
            });
            addTagListEles[j].appendChild(removeEle);
        }
    }
}

function getTags(parentEle){
    var tags = "";
    for (let index = 0; index < parentEle.querySelectorAll("div").length; index++) {
        const element = parentEle.querySelectorAll("div")[index];
        if (element.getAttribute("data-selected") == "true"){
            tags += "," + element.getAttribute("data-tag-name");
        }
    }
    return tags.slice(-(tags.length - 1));
}
function onSubmit(){
    var description = textDescriptionEle.value;
    var tags = getTags(addTagListEle);
    var deadline = deadlineDatetimeEle.value;
    console.log(description);
    console.log(tags);
    console.log(deadline);
    if (description == ""){
        alert("Description cannot be empty");
        return;
    }

    var currentDate = Date.now();
    if (submitButtonEle.getAttribute("data-mode") == "add"){
        var id = currentDate;
        var storeItem = {
            "id": currentDate,
            "edit_date": currentDate,
            "description": description,
            "tags": tags,
            "deadline": deadline,
            "checked": false
        }
        
    } else {
        var id = submitButtonEle.getAttribute("data-mode").split("-")[1];
        var checkboxEles = document.querySelectorAll("input[type=checkbox]");
        var checked = false;
        for (let index = 0; index < checkboxEles.length; index++) {
            if (checkboxEles[index].getAttribute("data-item-id") == id.toString()){
                checked = checkboxEles[index].checked;
            }
        }
        var storeItem = {
            "id": id,
            "edit_date": currentDate,
            "description": description,
            "tags": tags,
            "deadline": deadline,
            "checked": checked
        }
    
    }
    localStorage.setItem("item-" + id, JSON.stringify(storeItem));

    clearEditStatus();

    refreshTodoList();
    document.querySelector("#cardList").scrollIntoView({behavior: 'smooth', block: 'start'});
}

function clearEditStatus(){
    textDescriptionEle.value = null;
    var tagItems = addTagListEle.querySelectorAll("div")
    for (let index = 0; index < tagItems.length; index++) {
        tagItems[index].setAttribute("data-selected", false);
        tagItems[index].style.backgroundColor = tagColorNotSeletced;
    }
    deadlineDatetimeEle.value = null;

    submitButtonEle.setAttribute("data-mode", "add");
    addCardTitle.innerHTML = "Add";
    cancelButtonEle.style.display = "none";
}

function refreshTodoList(keyword, tags){
    var listEle = document.querySelector("#list");
    listEle.innerHTML = "";
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.slice(0, 5) != "item-") continue;

        var item = JSON.parse(localStorage.getItem(key));

        if (keyword != null){
            if (!item["description"].includes(keyword)){
                continue;
            }
        }
        if (tags != null && tags != ""){
            var selectedTags = tags.split(",");
            var targetTags = item["tags"].split(",");
            var display = true;
            for (let i = 0; i < selectedTags.length; i++) {
                var stat = false;
                for (let j = 0; j < targetTags.length; j++) {
                    if (selectedTags[i] == targetTags[j]){
                        stat = true;
                    }
                }
                if (!stat){
                    display = false;
                    break;
                }
            }
            if (!display){
                continue;
            }
        }
        
        var tagDisplay = "block";
        if (item["tags"] == "") tagDisplay = "none";
        var deadlineDisplay = "block";
        if (item["deadline"] == "") deadlineDisplay = "none";
        var itemInnerEleText = `
            <table style="width: 100%;">
                <tr>
                    <td style="width: 28px;">
                        <input type="checkbox" data-item-id="${item["id"]}" onchange="onSwitchChecked(this)">
                    </td>
                    <td style="width: 1fr;">
                        <div class="todo-item-description">${item["description"]}</div>
                        <div class="todo-item-tag" style="display: ${tagDisplay}">${item["tags"]}</div>
                        <div class="todo-item-deadline" style="display: ${deadlineDisplay}">${item["deadline"].replace(/T/, ' ').replace(/\..+/, '').substring(0, 19)}</div>
                    </td>
                    <td style="width: 20px;" class="todo-item-operations">
                        <button onclick="onEditButtonClick(this)" data-item-id="${item["id"]}">
                            <img src="icon/edit_24dp_434343_FILL0_wght400_GRAD0_opsz24.svg"></button>
                        </button>
                        <button onclick="onDeleteButtonClick(this)" data-item-id="${item["id"]}">
                            <img src="icon/delete_24dp_434343_FILL0_wght400_GRAD0_opsz24.svg"></button>
                        </button>
                    </td>
                </tr>
            </table>
        `;
        var itemEle = document.createElement("div");
        itemEle.innerHTML = itemInnerEleText;
        itemEle.setAttribute("data-item-id", item["id"]);
        itemEle.className = "todo-item";
        if (item["checked"]){
            itemEle.querySelector(`input`).checked = true;
        }
        listEle.appendChild(itemEle);
    }
}

function onEditButtonClick(element){
    clearEditStatus();

    addCardTitle.innerHTML = "Edit";
    cancelButtonEle.style.display = "inline";

    var id = element.getAttribute("data-item-id");
    submitButtonEle.setAttribute("data-mode", `edit-${id}`);
    var item = JSON.parse(localStorage.getItem("item-" + id));
    textDescriptionEle.value = item["description"];
    deadlineDatetimeEle.value = item["deadline"];
    var tagList = item["tags"].split(",");
    for (let i = 0; i < tagList.length; i++) {
        var tagEles = addTagListEle.children;
        for (let j = 0; j < tagEles.length; j++) {

            if (tagEles[j].getAttribute("data-tag-name") == tagList[i] && tagEles[j].tagName == "DIV"){
                tagEles[j].setAttribute("data-selected", true);
                tagEles[j].style.backgroundColor = tagColorSeletced;
            }
        }
    }

    document.querySelector("#editCard").scrollIntoView({behavior: 'smooth', block: 'start'});
}
function onDeleteButtonClick(element){
    var isRemove = confirm("Are you sure to remove this todo?")
    if (!isRemove) return;

    var id = element.getAttribute("data-item-id");
    localStorage.removeItem("item-" + id);

    refreshTodoList();
}
function onSwitchChecked(element){
    var id = element.getAttribute("data-item-id");
    var itemObj = JSON.parse(localStorage.getItem("item-" + id));
    //itemObj["edit_date"] = Date.now();
    itemObj["checked"] = element.checked;
    localStorage.setItem("item-" + id, JSON.stringify(itemObj));
}

function autoRemove(){
    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.slice(0, 5) != "item-") continue;

        var item = JSON.parse(localStorage.getItem(key));
        if(item["deadline"] == "") continue;
        var deadlineTimeStamp = new Date(item["deadline"]).getTime() + 60 * 1000;
        if (Date.now() > deadlineTimeStamp){
            localStorage.removeItem(key);
        }
    }
}
function removeAllTodo(){
    var isRemove = confirm("Are you sure to remove all todo?")
    if (!isRemove) return;

    for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);
        if (key.slice(0, 5) != "item-") continue;

        localStorage.removeItem(key);
    }
    refreshTodoList();
}

onload = function(){
    addTagListEle = document.querySelector("#add-taglist");
    textDescriptionEle = document.querySelector("#text-description");
    deadlineDatetimeEle = document.querySelector("#deadline-datetime");
    submitButtonEle = document.querySelector("#submit");
    addCardTitle = document.querySelector("body > div > div > div:nth-child(2) > div:nth-child(2) > header > span");
    cancelButtonEle = document.querySelector("#cancel");
    textFilterEle = document.querySelector("#text-filter");
    addTagInputEle = this.document.querySelector("#add-tag");

    document.querySelector("#add-tag-button").addEventListener("click", addTag);
    document.querySelector("#removeAll").addEventListener("click", removeAllTodo);
    submitButtonEle.addEventListener("click", onSubmit);
    cancelButtonEle.addEventListener("click", clearEditStatus);
    textFilterEle.addEventListener("input", function(){
        keywordFiltered = textFilterEle.value;
        refreshTodoList(keywordFiltered, tagsFiltered);
    });
    addTagInputEle.addEventListener("keydown", function(event) {
        if (event.keyCode === 13) {
            addTag();
        }
    });

    autoRemove();

    refreshTagList();
    refreshTodoList();
}