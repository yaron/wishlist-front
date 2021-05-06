var link = document.createElement( "link" );
link.href = 'css/'+config.theme+".css";
link.type = "text/css";
link.rel = "stylesheet";
link.media = "screen,print";

document.getElementsByTagName("head")[0].appendChild( link );