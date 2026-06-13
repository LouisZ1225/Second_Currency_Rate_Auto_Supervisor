const courses = [
    {
        id: 1,
        category:"product",
        title: "第1期",
        description: "《主动谋划 体系推销 创造需求 ——产品方案整体介绍》",
        cover: "../images/cover1.jpg",
        video: "../videos/sample1.mp4"
    },
    {
        id: 2,
        category:"product",
        title: "第2期",
        description: "《雷达典型产品》",
        cover: "../images/cover2.jpg",
        video: "../videos/sample2.mp4"
    },
    {
        id: 3,
        category:"product",
        title: "第3期",
        description: "《区域防空预警系统》",
        cover: "../images/cover3.jpg",
        video: "../videos/sample3.mp4"
    },
    {
        id: 4,
        category:"product",
        title: "第4期",
        description: "《通信电子对抗系统》",
        cover: "../images/cover4.jpg",
        video: "../videos/sample4.mp4"
    },
    {
        id: 5,
        category:"product",
        title: "第5期",
        description: "《雷达电子对抗系统》",
        cover: "../images/cover5.jpg",
        video: "../videos/sample1.mp4"
    },
    {
        id: 6,
        category:"product",
        title: "第6期",
        description: "《网络安全运营中心SOC、网络靶场》",
        cover: "../images/cover6.jpg",
        video: "../videos/sample2.mp4"
    },
    {
        id: 7,
        category:"product",
        title: "第7期",
        description: "《开源情报中心、密码与加密》",
        cover: "../images/cover7.jpg",
        video: "../videos/sample3.mp4"
    },
    {
        id: 8,
        category:"product",
        title: "第8期",
        description: "《水陆无人装备、人工智能》",
        cover: "../images/cover8.jpg",
        video: "../videos/sample4.mp4"
    },
    {
        id: 9,
        category:"product",
        title: "第9期",
        description: "《国家防火墙》",
        cover: "../images/cover9.jpg",
        video: "../videos/sample1.mp4"
    }
];

const params =
    new URLSearchParams(window.location.search);

const courseId =
    Number(params.get("id"));

// 根据 URL 里的 id 找到当前课程
let currentCourse =
    courses.find(c => c.id === courseId);

// 如果 URL 没有 id，或者 id 找不到，默认显示第一门课程
if (!currentCourse) {
    currentCourse = courses[0];
}

const titleEl =
    document.getElementById("title");

const descriptionEl =
    document.getElementById("description");

const videoEl =
    document.getElementById("video-player");

const list =
    document.getElementById("course-list");


// 渲染左侧课程内容
function renderCourse(course) {

    titleEl.innerText =
        course.title;

    descriptionEl.innerText =
        course.description;

    videoEl.src =
        course.video;

    videoEl.load();
}


// 渲染右侧课程目录
function renderCourseList(category) {

    list.innerHTML = "";

    const filteredCourses =
        courses.filter(c => c.category === category);

    filteredCourses.forEach(course => {

        const li =
            document.createElement("li");

        li.innerText =
            course.title + " " + course.description;

        if (course.id === currentCourse.id) {
            li.classList.add("active");
        }

        li.onclick = () => {

            currentCourse = course;

            renderCourse(course);

            renderCourseList(category);

            history.pushState(
                null,
                "",
                "course.html?id=" + course.id
            );
        };

        list.appendChild(li);

    });
}


// 初始化页面
renderCourse(currentCourse);

renderCourseList(currentCourse.category);