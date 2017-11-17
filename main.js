var questionList = [];
var questionIds = [];
var questionId;


function buildTheList() {
    let questionItem = "";
    let diff;
    $(".questionList ul").empty();
    console.log(questionList);
    for (let i = 0; i < questionList.length; i++) {
        let answers = "";
        let localDate = questionList[i].date;
        let now = new Date();
        if (localDate) {
            diff = Math.abs(new Date(localDate).getTime() - now.getTime());
            diff = Math.floor(parseInt(diff / (1000 * 60)));
        } else {
            diff = "";
        }
        if (questionList[i].answers) {
            for (let j = 0; j < questionList[i].answers.length; j++) {
                var ansNumber = j+1;
                answers += "<li class='single-answer'>" + ansNumber + ": " + questionList[i].answers[j].text + "</li>";
            }
        }
        
        questionItem += `
            <li class="card">
                <span class="close">
                    <span class="close-btn">X</span>
                    <span class="q-before">לפני ${diff} דקות</span>
                </span>
                <span class="question-content">
                    <span class="question-text">
                        <span class="main-content-card">${questionList[i].text}</span>
                        <hr>
                        תוכן השאלה:
                        <br>
                        <br>
                        ${questionList[i].question}
                        <hr>
                        <p>תשובות</p>
                        <ul class="answers-list">
                            ${answers}
                        </ul>
                        <form class="ans-form" data-q_id="${questionList[i]._id}">
                            <textarea class="answer" placeholder="הקלד / הקלידי תשובה"></textarea>
                            <button class="submit-answer">תגובה</button>
                        </form>
                    </span>
                    <span class="question-source">בראשית א א</span>
                </span>
            </li>
        `
    }
    $(".questionList ul").append(questionItem);
}

function fecthQuestions(){
    $.ajax({
        method: "GET",
        cache: false,
        crossDomain: true,
        url: "https://4870ee3b.ngrok.io/questions",
        beforeSend: function(){
        },
        success: function(data) {
            questionList = data;
        },
        complete: buildTheList()
    })
}

function answer(id, content) {
    $.ajax({
        method: "POST",
        cache: false,
        crossDomain: true,
        url: "https://4870ee3b.ngrok.io/answer",
        data: {
            answer: {
                questionId: id,
                text: content
            }
        },
        beforeSend: function(){
        },
        success: function(data) {
            console.log(data);
        },
        complete: buildTheList()
    })
}

var getQuestionInterval = setInterval(fecthQuestions, 5000);

function addCode() {
    var currentLocation = window.location.href;
    var questionHtml = `
    <div class="categoryFilterGroup toHide" style="border-top: 4px solid rgb(72, 113, 191);">
        <a id="ask-question">
            <div class="categoryFilter" data-name="Commentary">
                <span class="he he" style="display:block !important;">
                    שאל שאלה
                    <span class="questionArea">
                        <form>
                            <textarea id="questionText" class="toHide" rows="" cols="" placeholder="שאל שאלה על הקטע הנבחר"></textarea>
                            <button class="btn btn-success toHide" id="sendQuestion" type='button'>שלח</button>
                        </form>
                    </span>
                </span> 
            </div>
        </a>
    </div>
    <div class="categoryFilterGroup toHide" style="border-top: 4px solid rgb(72, 113, 191);">
        <a id="">
            <div class="categoryFilter" data-name="Commentary">
                <span class="he he" style="display:block !important;">
                    חברותא צ'אט
                    <span class="enInHe questionArea">
                        <div class="questionList">
                            <ul class="questions-list">
                                טוען צ'אט שאלות אונליין, נא להמתין...
                            </ul>
                        </div>
                    </span>
                </span> 
            </div>
        </a>
    </div>`;

    $(".contentInner > div > div > .categoryFilterGroup:first-child").before(questionHtml);

    $("#sendQuestion").on("click", function (e) {
        var currentDate = new Date();

        // $(".toHide").hide();
        alertify.closeAll();
        alertify.success('&#10004; שאלתך נשלחה בהצלחה, נודיע לך כשתתקבל תשובה',5);

        var JsonToSendData = {
            question: {
                url: window.location.href,
                question: $("#questionText").val(),
                date: currentDate,
                text: $(".highlight p:first").text()
            }
        };

        var saveData = $.ajax({
            type: 'POST',
            url: "https://4870ee3b.ngrok.io/question",
            data: JsonToSendData,
            dataType: "json",
            success: function (resultData) { questionId = resultData.id; }
        });

        return false;
    });
}

$("document").ready(function(){

    setTimeout(function(){
        addCode();

        // $("#ask-question").on("click", function(e){
        //     var currentDate = new Date();
            
        //     $("#questionDate").val(currentDate);
        //     return false;
        // });

        
        $(".questionList ul").delegate(".question-text .main-content-card", "click", function(){
            if($(this).closest(".question-text").hasClass("open")) {
                $(this).closest(".question-text").removeClass("open");
                if (!$(this).closest(".card").siblings(".card").find(".question-text").hasClass("open")) {
                    getQuestionInterval = setInterval(fecthQuestions, 5000);
                }
            } else {
                clearInterval(getQuestionInterval);
                $(this).closest(".question-text").addClass("open");
            }

        });

        $(".contentInner").delegate(".ans-form", "submit", function(e){
            e.preventDefault();
            var ansContent = $(this).find(".answer").val();
            var qId = $(this).data("q_id");
            answer(qId, ansContent);
            return false;
        })
    }, 5000);

    // check if someone reply for your question
    var interval = setInterval(() => {
        if (!questionId) return;
        
        $.get("https://4870ee3b.ngrok.io/answer?questionId="+questionId, function(data, status){
            if(!data.answers || !data.answers.length) return;
            questionId = null;
            
            alertify.success('התקבלה תשובה לשאלתך! לחץ כדי לקרוא','50');
            $(".alertify-notifier").on("click", function(){
                alertify.closeAll();
                alertify.success(data.answers[0].text,'500');
            });
        });
    
    }, 5000);


})


$(".segment").click(function(){
    $(".toHide").hide();

    if($("#ask-question").length > 0) {
        addCode();
    }
})
