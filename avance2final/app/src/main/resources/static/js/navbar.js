window.addEventListener("scroll", () => {
    const navbar = document.querySelector(".custom-navbar");
    if(window.scrollY > 50){
        navbar.style.background = "rgba(2,6,23,0.95)";
    }else{
        navbar.style.background = "rgba(15,23,42,0.8)";
    }
});