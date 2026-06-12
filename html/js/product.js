const courseList = document.getElementById("course-list");

const productCourses =
    courses.filter(
        course => course.category === "product"
    );

productCourses.forEach(course => {

    const card = document.createElement("div");
    card.className = "course-card";

    card.innerHTML = `
        <img src="${course.cover}" class="course-cover">
        <h3>${course.title}</h3>
        <p>${course.description}</p>
    `;

    card.addEventListener("click", () => {
        openCourse(course.id);
    });

    courseList.appendChild(card);

});

function openCourse(id){
    window.location.href =
        `course.html?id=${id}`;
}
