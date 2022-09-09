let theme = localStorage.getItem("theme");
if ((theme === "light-theme")||(theme==null)) {
  theme = "light-theme";
  document.getElementById("themeSwitcher").checked = false;
} else if (theme === "dark-theme") {
  theme = "dark-theme";
  document.getElementById("themeSwitcher").checked = true;
}
document.body.className = theme;
localStorage.setItem("theme", theme);

function switchTheme() {
  theme = localStorage.getItem("theme");
  if (theme === "light-theme") {
    theme = "dark-theme";
    document.getElementById("themeSwitcher").checked = true;
  } else {
    theme = "light-theme";
    document.getElementById("themeSwitcher").checked = false;
  }
  document.body.className = theme;
  localStorage.setItem("theme", theme);

  console.log(theme);
}
