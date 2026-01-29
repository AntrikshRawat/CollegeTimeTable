import { useState, useEffect, useRef, useMemo } from 'react';
import App from './App';

const Import = () => {
  const [isMobile, setIsMobile] = useState(false);
  const bookmarkRef = useRef(null);

  const TABLE_SELECTOR = "table"; 
  const MY_WEBSITE_URL = useMemo(() => window.location.origin + window.location.pathname, []);

  const bookmarkletCode = useMemo(() => {
    return `javascript:(function(){var t=document.querySelector('${TABLE_SELECTOR}');if(!t){alert('Table not found!');return;}var d=[];var rows=t.querySelectorAll('tr');rows.forEach(r=>{var rowData=[];r.querySelectorAll('td,th').forEach(c=>rowData.push(c.innerText.trim()));if(rowData.length>0)d.push(rowData);});window.location.href='${MY_WEBSITE_URL}?data='+encodeURIComponent(JSON.stringify(d));})();`
      .replace(/\s+/g, ' ').trim();
  }, [MY_WEBSITE_URL]);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    setIsMobile(/android|iphone|ipad|ipod/.test(ua));

    if (bookmarkRef.current) {
      bookmarkRef.current.setAttribute('href', bookmarkletCode);
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('data')) {
      try {
        const rawData = urlParams.get('data');
        const parsedData = JSON.parse(decodeURIComponent(rawData));
        
        const timeTable = {};
        for (let i = 0; i < Math.min(parsedData.length, 7); i++) {
          let data = parsedData[i];
          if (!data || !data[0]) continue;
          let day = data[0];
          const classes = data[1].trim().split(/\n\s*\n/).map(block => {
            const lines = block.split('\n').map(line => line.trim());
            return {
              time: lines[0], total_hours: lines[1], subject: lines[2],
              teacher: lines[5], location: lines[4]
            };
          });
          timeTable[day] = classes;
        }
        
        localStorage.setItem('myTimetable', JSON.stringify(timeTable));
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.error(e);
      }
    }
  }, [bookmarkletCode]);

  // RELIABLE COPY FUNCTION
  const copyScript = () => {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern approach
      navigator.clipboard.writeText(bookmarkletCode).then(() => {
        alert("✅ Script copied successfully!");
      });
    } else {
      // Fallback approach for non-HTTPS or older browsers
      const textArea = document.createElement("textarea");
      textArea.value = bookmarkletCode;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert("✅ Script copied successfully! (Fallback)");
      } catch (err) {
        alert("❌ Unable to copy. Please manually select the text.");
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 text-center font-sans">
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-slate-800 mb-6 tracking-tight">
        Import Timetable
      </h1>
          {isMobile ? (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm font-medium">
                📱 Mobile detected: Use the Bookmark Method
              </div>
              
              <button 
                onClick={copyScript}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-transform"
              >
                📋 Copy Import Script
              </button>

              <div className="text-left text-sm text-slate-500 space-y-4 bg-slate-50 p-5 rounded-lg border border-slate-200">
                <p className="font-bold text-slate-700 uppercase tracking-tight text-xs">Steps for Android:</p>
                <ol className="list-decimal list-outside ml-4 space-y-3">
                  <li><strong>Create a placeholder:</strong> Open a New Tab in Chrome then Bookmark this current page (tap three dots ⋮ then ☆).</li>
                  <li><strong>Edit the Bookmark:</strong> Go to Bookmarks, find the bookmark, tap the dots next to it, and select <strong>Edit</strong>.</li>
                  <li><strong>Update URL:</strong> Clear the "URL" field and <strong>paste</strong> the script you just copied. Change the name to "Import Timetable".</li>
                  <li><strong>Run the script:</strong> Log in to your <strong>College Dashboard</strong> where the timetable is.</li>
                  <li><strong>Import:</strong> Tap the address bar, type "Import Timetable", and click the bookmark result that appears.(look for the bookmark in listed result)</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-slate-600 font-medium">💻 Desktop detected</p>
              <a 
                ref={bookmarkRef}
                className="inline-block bg-blue-600 text-white font-bold py-3 px-10 rounded-xl cursor-move shadow-md hover:bg-blue-700 transition-colors"
              >
                Drag to Bookmarks Bar
              </a>
              <p className="text-xs text-slate-400">Press Ctrl+Shift+B to show bookmarks bar</p>
            </div>
          )}
        </div>
    </div>
  );
};

const Home = () =>{
  const [timetable, setTimetable] = useState(null);

  useEffect(()=>{
    let timeTable = JSON.parse(localStorage.getItem("myTimetable"));
    setTimetable(timeTable);
  },[]);

  if(!timetable) return <Import/>;

  return <App timetableData={timetable}/>;
}

export default Home;