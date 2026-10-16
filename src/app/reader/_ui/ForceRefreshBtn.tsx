"use client"

function forceRefresh() {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:99999;';
  document.body.appendChild(overlay);

  setTimeout(function() {
    overlay.style.background = '#fff';
  }, 80);

  setTimeout(function() {
    overlay.parentNode.removeChild(overlay);
  }, 160);
}

export default function ForceRefreshBtn() {
  return (
    <button className="btn" onClick={() => { forceRefresh() }}>Force Refresh</button>
  )
}
