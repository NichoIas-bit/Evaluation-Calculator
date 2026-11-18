
/* =========================================
   EVALUATION CALCULATOR
   ระบบคำนวณแบบประเมินความพึงพอใจ
========================================= */


/* =========================================
   1. ELEMENTS
========================================= */

const totalRespondentsInput = document.getElementById("totalRespondents");
const mainTopicCountInput = document.getElementById("mainTopicCount");
const createTopicsBtn = document.getElementById("createTopicsBtn");
const topicsContainer = document.getElementById("topicsContainer");
const resultsContainer = document.getElementById("resultsContainer");


/* =========================================
   2. DATA
========================================= */

let topics = [];

const ratingLevels = [
    { key: "n5", label: "มากที่สุด", score: 5 },
    { key: "n4", label: "มาก", score: 4 },
    { key: "n3", label: "ปานกลาง", score: 3 },
    { key: "n2", label: "น้อย", score: 2 },
    { key: "n1", label: "น้อยที่สุด", score: 1 }
];


/* =========================================
   3. CREATE MAIN TOPICS
========================================= */

createTopicsBtn.addEventListener("click", () => {

    const count = Number(mainTopicCountInput.value);

    if (!Number.isInteger(count) || count < 1) {
        alert("กรุณากรอกจำนวนหัวข้อหลักให้ถูกต้อง");
        return;
    }

    if (count > 50) {
        alert("กำหนดหัวข้อหลักได้สูงสุด 50 หัวข้อ");
        return;
    }

    topics = Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: `หัวข้อหลักที่ ${index + 1}`,
        subTopics: []
    }));

    renderTopics();
    calculateResults();

});


/* =========================================
   4. RENDER MAIN TOPICS
========================================= */

function renderTopics() {

    topicsContainer.innerHTML = "";

    topics.forEach(topic => {

        const topicElement = document.createElement("div");

        topicElement.className = "main-topic";

        topicElement.innerHTML = `

            <div class="main-topic-header">

                <h3>หัวข้อหลัก ${topic.id}</h3>

                <button
                    type="button"
                    class="btn btn-add"
                    data-action="add-subtopic"
                    data-topic-id="${topic.id}">

                    + เพิ่มหัวข้อย่อย

                </button>

            </div>


            <div class="form-group">

                <label>ชื่อหัวข้อหลัก</label>

                <input
                    type="text"
                    class="topic-name"
                    data-topic-id="${topic.id}"
                    value="${escapeHTML(topic.name)}">

            </div>


            <div class="subtopics-container">

                ${
                    topic.subTopics.length === 0

                    ? '<p class="empty-message">ยังไม่มีหัวข้อย่อย</p>'

                    : topic.subTopics.map(sub =>
                        renderSubTopic(topic.id, sub)
                    ).join("")
                }

            </div>

        `;

        topicsContainer.appendChild(topicElement);

    });

}


/* =========================================
   5. RENDER SUB TOPICS
========================================= */

function renderSubTopic(topicId, sub) {

    const ratingInputs = ratingLevels.map(level => `

        <div class="rating-item">

            <div class="rating-label">

                <strong>${level.key.toUpperCase()}</strong>

                <span>${level.label}</span>

                <small>คะแนน ${level.score}</small>

            </div>


            <div class="number-control">

                <button
                    type="button"
                    class="number-btn decrease-btn"
                    data-action="decrease"
                    data-topic-id="${topicId}"
                    data-sub-id="${sub.id}"
                    data-rating="${level.key}">

                    −

                </button>


                <input
                    type="number"
                    min="0"
                    step="1"
                    value="${sub[level.key]}"
                    data-topic-id="${topicId}"
                    data-sub-id="${sub.id}"
                    data-rating="${level.key}"
                    aria-label="${level.label}">


                <button
                    type="button"
                    class="number-btn increase-btn"
                    data-action="increase"
                    data-topic-id="${topicId}"
                    data-sub-id="${sub.id}"
                    data-rating="${level.key}">

                    +

                </button>

            </div>

        </div>

    `).join("");


    return `

        <div class="sub-topic">

            <div class="sub-topic-header">

                <h4>
                    ${topicId}.${sub.id} ${escapeHTML(sub.name)}
                </h4>

            </div>


            <div class="form-group">

                <label>ชื่อหัวข้อย่อย</label>

                <input
                    type="text"
                    value="${escapeHTML(sub.name)}"
                    data-topic-id="${topicId}"
                    data-sub-id="${sub.id}"
                    data-field="name">

            </div>


            <div class="rating-grid">

                ${ratingInputs}

            </div>


            <div class="subtopic-total">

                <span>จำนวนผู้ตอบทั้งหมด</span>

                <strong>${getSubTotal(sub)} คน</strong>

            </div>


            <button
                type="button"
                class="btn btn-danger"
                data-action="remove-subtopic"
                data-topic-id="${topicId}"
                data-sub-id="${sub.id}">

                ลบหัวข้อย่อย

            </button>

        </div>

    `;

}


/* =========================================
   6. HTML ESCAPE
========================================= */

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

}


/* =========================================
   7. GET SUB TOPIC TOTAL
========================================= */

function getSubTotal(sub) {

    return ratingLevels.reduce((total, level) => {

        return total + (Number(sub[level.key]) || 0);

    }, 0);

}


/* =========================================
   8. ADD / REMOVE / INCREASE / DECREASE
========================================= */

topicsContainer.addEventListener("click", event => {

    const button = event.target.closest("button");

    if (!button) return;

    const action = button.dataset.action;

    const topicId = Number(button.dataset.topicId);

    const topic = topics.find(item => item.id === topicId);

    if (!topic) return;


    /* ADD SUB TOPIC */

    if (action === "add-subtopic") {

        const newId = Math.max(
            0,
            ...topic.subTopics.map(sub => sub.id)
        ) + 1;

        topic.subTopics.push({

            id: newId,

            name: `หัวข้อย่อย ${newId}`,

            n5: 0,
            n4: 0,
            n3: 0,
            n2: 0,
            n1: 0

        });

    }


    /* REMOVE SUB TOPIC */

    else if (action === "remove-subtopic") {

        const subId = Number(button.dataset.subId);

        topic.subTopics = topic.subTopics.filter(
            sub => sub.id !== subId
        );

        topic.subTopics.forEach((sub, index) => {

            sub.id = index + 1;

        });

    }


    /* INCREASE / DECREASE */

    else if (action === "increase" || action === "decrease") {

        const subId = Number(button.dataset.subId);

        const rating = button.dataset.rating;

        const sub = topic.subTopics.find(
            item => item.id === subId
        );

        if (!sub || !ratingLevels.some(level => level.key === rating)) {
            return;
        }

        if (action === "increase") {

            sub[rating] = (Number(sub[rating]) || 0) + 1;

        } else {

            sub[rating] = Math.max(
                0,
                (Number(sub[rating]) || 0) - 1
            );

        }

    }

    else {

        return;

    }


    renderTopics();

    calculateResults();

});


/* =========================================
   9. INPUT EVENTS
========================================= */

topicsContainer.addEventListener("input", event => {

    const input = event.target;

    const topicId = Number(input.dataset.topicId);

    const topic = topics.find(item => item.id === topicId);

    if (!topic) return;


    /* MAIN TOPIC NAME */

    if (input.classList.contains("topic-name")) {

        topic.name = input.value;

        calculateResults();

        return;

    }


    const subId = Number(input.dataset.subId);

    const sub = topic.subTopics.find(
        item => item.id === subId
    );

    if (!sub) return;


    /* SUB TOPIC NAME */

    if (input.dataset.field === "name") {

        sub.name = input.value;

        calculateResults();

        return;

    }


    /* RATING INPUT */

    const rating = input.dataset.rating;

    if (rating && ratingLevels.some(level => level.key === rating)) {

        const value = input.value;

        if (value === "") {

            sub[rating] = 0;

        } else {

            const number = Number(value);

            sub[rating] = Number.isFinite(number)
                ? Math.max(0, Math.floor(number))
                : 0;

        }

        calculateResults();

        // Update total without rebuilding the input
        const totalElement = input
            .closest(".sub-topic")
            ?.querySelector(".subtopic-total strong");

        if (totalElement) {

            totalElement.textContent = `${getSubTotal(sub)} คน`;

        }

    }

});


/* =========================================
   10. CALCULATE AVERAGE
========================================= */

function calculateAverage(sub) {

    const total = getSubTotal(sub);

    const score = ratingLevels.reduce((sum, level) => {

        return sum + (
            (Number(sub[level.key]) || 0) * level.score
        );

    }, 0);


    if (total === 0) {

        return {
            average: null,
            total: 0
        };

    }


    return {

        average: score / total,

        total: total

    };

}


/* =========================================
   11. CALCULATE ALL RESULTS
========================================= */

function calculateResults() {

    const expectedTotal = Number(totalRespondentsInput.value);


    if (!Number.isInteger(expectedTotal) || expectedTotal < 1) {

        resultsContainer.innerHTML = `

            <p class="result-warning">

                กรุณากรอกจำนวนผู้ประเมินให้ถูกต้อง

            </p>

        `;

        return;

    }


    if (topics.length === 0) {

        resultsContainer.innerHTML = `

            <p class="empty-message">

                ยังไม่มีหัวข้อประเมิน

            </p>

        `;

        return;

    }


    let allSubtopicAverages = [];

    let html = "";


    /* LOOP MAIN TOPICS */

    topics.forEach(topic => {

        html += `

            <div class="result-item">

                <h3>

                    ${topic.id}. ${escapeHTML(topic.name)}

                </h3>

        `;


        let topicAverages = [];


        /* LOOP SUB TOPICS */

        topic.subTopics.forEach(sub => {

            const result = calculateAverage(sub);

            const isValid = result.total === expectedTotal;


            if (result.average !== null && isValid) {

                topicAverages.push(result.average);

                allSubtopicAverages.push(result.average);

            }


            html += `

                <div class="result-sub-item">

                    <strong>

                        ${topic.id}.${sub.id}

                        ${escapeHTML(sub.name)}

                    </strong>


                    <div class="result-score">

                        ${
                            result.average === null
                            ? "-"
                            : result.average.toFixed(2)
                        }

                    </div>


                    <p>

                        จำนวนผู้ตอบ:

                        ${result.total} / ${expectedTotal}

                    </p>


                    ${
                        result.average === null

                        ? '<p class="result-warning">ยังไม่มีข้อมูล</p>'

                        : isValid

                            ? '<p class="result-success">จำนวนผู้ตอบครบแล้ว</p>'

                            : '<p class="result-warning">จำนวนผู้ตอบไม่ตรงกับ N</p>'

                    }

                </div>

            `;

        });


        /* MAIN TOPIC AVERAGE */

        const topicAverage = topicAverages.length > 0

            ? topicAverages.reduce((sum, value) => sum + value, 0)
                / topicAverages.length

            : null;


        html += `

            <hr>

            <div class="main-topic-average">

                <strong>ค่าเฉลี่ยหัวข้อหลัก</strong>

                <div class="result-score">

                    ${
                        topicAverage === null
                        ? "-"
                        : topicAverage.toFixed(2)
                    }

                </div>

            </div>

            </div>

        `;

    });


    /* =====================================
       OVERALL AVERAGE
    ===================================== */

    const overallAverage = allSubtopicAverages.length > 0

        ? allSubtopicAverages.reduce((sum, value) => sum + value, 0)
            / allSubtopicAverages.length

        : null;


    html += `

        <div class="total-result">

            <h3>ค่าเฉลี่ยรวมทั้งหมด</h3>

            <div class="result-score">

                ${
                    overallAverage === null
                    ? "-"
                    : overallAverage.toFixed(2)
                }

            </div>

        </div>

    `;


    resultsContainer.innerHTML = html;

}


/* =========================================
   12. RESPONDENT COUNT EVENT
========================================= */

totalRespondentsInput.addEventListener(
    "input",
    calculateResults
);


/* =========================================
   13. INITIALIZATION
========================================= */

resultsContainer.innerHTML = `

    <p class="empty-message">

        กรุณากรอกข้อมูลเพื่อคำนวณ

    </p>

`;

console.log("Evaluation Calculator is ready!");
