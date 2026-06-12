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
    },
    {
        id: 10,
        category:"product",
        title: "第10期",
        description: "《无人机和无人机蜂群》",
        cover: "../images/cover10.jpg",
        video: "../videos/sample2.mp4"
    },
    {
        id: 11,
        category:"product",
        title: "第11期",
        description: "《新概念武器》",
        cover: "../images/cover11.jpg",
        video: "../videos/sample3.mp4"
    },
    {
        id: 12,
        category:"product",
        title: "第12期",
        description: "《声学系统》",
        cover: "../images/cover12.jpg",
        video: "../videos/sample4.mp4"
    },
    {
        id: 13,
        category:"product",
        title: "第13期",
        description: "《边境安防》",
        cover: "../images/cover13.jpg",
        video: "../videos/sample1.mp4"
    },
    {
        id: 14,
        category:"product",
        title: "第14期",
        description: "《电子对抗典型产品》",
        cover: "../images/cover14.jpg",
        video: "../videos/sample2.mp4"
    },
    {
        id: 15,
        category:"product",
        title: "第15期",
        description: "《轻高机地对空末端防御系统》",
        cover: "../images/cover15.jpg",
        video: "../videos/sample3.mp4"
    },
    {
        id: 16,
        category:"product",
        title: "第16期",
        description: "《军事通信系统》",
        cover: "../images/cover16.jpg",
        video: "../videos/sample4.mp4"
    },
    {
        id: 17,
        category:"product",
        title: "第17期",
        description: "《炮兵C41系统》",
        cover: "../images/cover17.jpg",
        video: "../videos/sample3.mp4"
    },
    {
        id: 18,
        category:"product",
        title: "第18期",
        description: "《浅谈网络空间安全》",
        cover: "../images/cover18.jpg",
        video: "../videos/sample4.mp4"
    },
    {
        id: 19,
        category:"product",
        title: "第19期",
        description: "《军事联合情报系统一瞥》",
        cover: "../images/cover19.jpg",
        video: "../videos/sample1.mp4"
    },
    {
        id: 20,
        category:"product",
        title: "第20期",
        description: "《航天技术与应用》",
        cover: "../images/cover20.jpg",
        video: "../videos/sample2.mp4"
    },
    {
        id: 21,
        category:"trade",
        title: "第1期",
        description: "《电科数字经济能力和产品谱系概况》",
        cover: "../images/trade1.jpg",
        video: "../videos/电科数字经济能力和产品谱系概况.mp4"
    },
    {
        id: 22,
        category:"trade",
        title: "第2期",
        description: "《市场开发与合同谈判经验分享》",
        cover: "../images/trade2.jpg",
        video: "../videos/市场开发与合同谈判经验分享.mp4"
    },
    {
        id: 23,
        category:"trade",
        title: "第3期",
        description: "《军贸工作中的外事手续办理》",
        cover: "../images/trade3.jpg",
        video: "../videos/军贸工作中的外事手续办理.mp4"
    },
    {
        id: 24,
        category:"trade",
        title: "第4期",
        description: "《原产地证申领教程》",
        cover: "../images/trade4.png",
        video: "../videos/sample4.mp4"
    },
    {
        id: 25,
        category:"trade",
        title: "第5期",
        description: "《海外常驻工作与经验分享》",
        cover: "../images/trade5.jpg",
        video: "../videos/海外常驻工作与经验分享.mp4"
    },
    {
        id: 26,
        category:"trade",
        title: "第6期",
        description: "《织密保密防线 护航项目建设》",
        cover: "../images/trade6.png",
        video: "../videos/sample2.mp4"
    },
    {
        id: 27,
        category:"trade",
        title: "第7期",
        description: "《军贸市场推销心得与案例分享》",
        cover: "../images/trade7.jpg",
        video: "../videos/军贸市场推销心得与案例分享.mp4"
    },
    {
        id: 28,
        category:"trade",
        title: "第8期",
        description: "《军贸项目上报公文行文标准》",
        cover: "../images/trade8.png",
        video: "../videos/sample4.mp4"
    },
    {
        id: 29,
        category:"trade",
        title: "第9期",
        description: "《项目全生命周期管理概述》",
        cover: "../images/trade9.jpg",
        video: "../videos/项目全生命周期管理概述.mp4"
    },
    {
        id: 30,
        category:"trade",
        title: "第10期",
        description: "《军证办理教程》",
        cover: "../images/trade10.png",
        video: "../videos/军证办理教程.mp4"
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