var scripsNum = 0;

[
  'scripts/utility/main.js',
  'scripts/table_widget/main.js'
].forEach(function(src) {
  var script = document.createElement('script');
  script.src = src;
  script.async = false;
  document.head.appendChild(script);
});

[
  'styles/table_widget/style.css'
].forEach(function(src) {
  var link = document.createElement('link');
  link.rel = "stylesheet";
  link.type = "text/css";
  link.href = src; 
  document.head.appendChild(link);
});
