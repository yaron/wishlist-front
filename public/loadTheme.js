var link = document.createElement("link");
link.href = "/css/" + config.theme + ".css";
link.rel = "stylesheet";

document.getElementsByTagName("head")[0].appendChild(link);
