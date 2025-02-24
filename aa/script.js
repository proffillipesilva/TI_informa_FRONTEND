// Referências aos elementos
const menuIcon = document.getElementById("menu-icon");
const sidebar = document.getElementById("sidebar");

// Mostra a sidebar quando o mouse entra na área do ícone de 3 pontos
menuIcon.addEventListener("mouseenter", function () {
    sidebar.style.left = "0"; // Abre a sidebar
});

// Esconde a sidebar quando o mouse sai da área da sidebar
sidebar.addEventListener("mouseleave", function () {
    sidebar.style.left = "-250px"; // Fecha a sidebar
});
