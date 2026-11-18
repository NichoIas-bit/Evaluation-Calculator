
/* =================================
   ELEMENTS
================================= */

const totalRespondentsInput = document.getElementById("totalRespondents");
const mainTopicCountInput = document.getElementById("mainTopicCount");
const createTopicsBtn = document.getElementById("createTopicsBtn");
const topicsContainer = document.getElementById("topicsContainer");
const resultsContainer = document.getElementById("resultsContainer");


/* =================================
   DATA
================================= */

let topics = [];

const ratingLevels = [
    { key: "n5", label: "มากที่สุด", score: 5 },
    { key: "n4", label: "มาก", score: 4 },
    { key: "n3", label: "ปานกลาง", score: 3 },
    { key: "n2", label: "น้อย", score: 2 },
    { key: "n1", label: "น้อยที่สุด", score: 1 }
];


/* =================================
   CREATE MAIN TOPICS
================================= */

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

    resultsContainer.innerHTML =
        '<p class="empty-message">กรุณากรอกข้อมูลเพื่อคำนวณ</p>';

});


/* =================================
   RENDER TOPICS
================================= */

function renderTopics() {

    topicsContainer.innerHTML = "";

    topics.forEach(topic => {

        const topicElement = document.createElement("div");

        topicElement.className = "main-topic";

        topicElement.innerHTML = `
            <div class="main-topic-header">

                <h3>หัวข้อหลัก ${topic.id}</h3>

                <button
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
                    value="${topic.name}">
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


/* =================================
   RENDER SUB TOPIC
================================= */

function renderSubTopic(topicId, sub) {

    const ratingInputs = ratingLevels.map(level => `

        <div class="rating-item">

            <label>
                ${level.key.toUpperCase()} (${level.score})
            </label>

            <input
                type="number"
                min="0"
                step="1"
                value="${sub[level.key]}"
                data-topic-id="${topicId}"
                data-sub-id="${sub.id}"
                data-rating="${level.key}"
                placeholder="จำนวนคน">

        </div>

    `).join("");

    return `

        <div class="sub-topic">

            <h4>
                ${topicId}.${sub.id} ${sub.name}
            </h4>

            <div class="form-group">

                <label>ชื่อหัวข้อย่อย</label>

                <input
                    type="text"
                    value="${sub.name}"
                    data-topic-id="${topicId}"
                    data-sub-id="${sub.id}"
                    data-field="name">

            </div>

            <div class="rating-grid">
                ${ratingInputs}
            </div>

            <button
                class="btn btn-danger"
                data-action="remove-subtopic"
                data-topic-id="${topicId}"
                data-sub-id="${sub.id}">
                ลบหัวข้อย่อย
            </button>

        </div>

    `;

}


/* =================================
   ADD / REMOVE SUB TOPIC
================================= */

topicsContainer.addEventListener("click", event => {

    const button = event.target.closest("button");

    if (!button) return;

    const topicId = Number(button.dataset.topicId);

    const topic = topics.find(item => item.id === topicId);

    if (!topic) return;

    if (button.dataset.action === "add-subtopic") {

        const newId = topic.subTopics.length + 1;

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

    if (button.dataset.action === "remove-subtopic") {

        const subId = Number(button.dataset.subId);

        topic.subTopics = topic.subTopics.filter(
            sub => sub.id !== subId
        );

        topic.subTopics.forEach((sub, index) => {
            sub.id = index + 1;
        });

    }

    renderTopics();
    calculateResults();

});


/* =================================
   INPUT EVENTS
================================= */

topicsContainer.addEventListener("input", event => {

    const input = event.target;

    const topicId = Number(input.dataset.topicId);

    const topic = topics.find(item => item.id === topicId);

    if (!topic) return;

    // Main topic name
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

    // Sub topic name
    if (input.dataset.field === "name") {

        sub.name = input.value;

        calculateResults();
        return;

    }

    // Rating values
    const rating = input.dataset.rating;

    if (rating) {

        const value = Number(input.value);

        sub[rating] = input.value === ""
            ? 0
            : Math.max(0, Number.isFinite(value) ? value : 0);

    }

    calculateResults();

});


/* =================================
   CALCULATE AVERAGE
================================= */

function calculateAverage(sub) {

    const n5 = Number(sub.n5) || 0;
    const n4 = Number(sub.n4) || 0;
    const n3 = Number(sub.n3) || 0;
    const n2 = Number(sub.n2) || 0;
    const n1 = Number(sub.n1) || 0;

    const total = n5 + n4 + n3 + n2 + n1;

    const score =
        (n5 * 5) +
        (n4 * 4) +
        (n3 * 3) +
        (n2 * 2) +
        (n1 * 1);

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


/* =================================
   CALCULATE ALL RESULTS
================================= */

function calculateResults() {

    const expectedTotal = Number(totalRespondentsInput.value);

    if (!Number.isInteger(expectedTotal) || expectedTotal < 1) {

        resultsContainer.innerHTML =
            '<p class="result-warning">กรุณากรอกจำนวนผู้ประเมินให้ถูกต้อง</p>';

        return;

    }

    if (topics.length === 0) {

        resultsContainer.innerHTML =
            '<p class="empty-message">ยังไม่มีหัวข้อประเมิน</p>';

        return;

    }

    let allSubtopicAverages = [];

    let html = "";

    topics.forEach(topic => {

        html += `
            <div class="result-item">

                <h3>${topic.id}. ${topic.name}</h3>
        `;

        let topicAverages = [];

        topic.subTopics.forEach(sub => {

            const result = calculateAverage(sub);

            const isValid = result.total === expectedTotal;

            if (result.average !== null && isValid) {

                topicAverages.push(result.average);

                allSubtopicAverages.push(result.average);

            }

            html += `

                <div>

                    <strong>
                        ${topic.id}.${sub.id} ${sub.name}
                    </strong>

                    <div class="result-score">

                        ${
                            result.average === null
                            ? "-"
                            : result.average.toFixed(2)
                        }

                    </div>

                    <p>
                        จำนวนผู้ตอบ: ${result.total} / ${expectedTotal}
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

        // Main topic average
        const topicAverage = topicAverages.length > 0
            ? topicAverages.reduce((sum, value) => sum + value, 0)
                / topicAverages.length
            : null;

        html += `

            <hr>

            <strong>ค่าเฉลี่ยหัวข้อหลัก</strong>

            <div class="result-score">
                ${
                    topicAverage === null
                    ? "-"
                    : topicAverage.toFixed(2)
                }
            </div>

            </div>

        `;

    });


    /* =================================
       OVERALL AVERAGE
    ================================= */

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


/* =================================
   RESPONDENT COUNT EVENT
================================= */

totalRespondentsInput.addEventListener(
    "input",
    calculateResults
);


/* =================================
   INITIALIZATION
================================= */

console.log("Evaluation Calculator is ready!");
