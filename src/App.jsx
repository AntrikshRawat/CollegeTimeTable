import { useState, useEffect } from "react";
import { format, parse, isAfter } from "date-fns";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards } from "swiper/modules";
import { timetableData } from "./data";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cards";

const App = () => {
  const [currentDay, setCurrentDay] = useState("");
  const [nextClass, setNextClass] = useState(null);
  const [remainingClasses, setRemainingClasses] = useState([]);
  const [isSunday, setIsSunday] = useState(false);

  useEffect(() => {
    const today = new Date();
    // Get full day name e.g. "Monday"
    const dayName = format(today, "EEEE");
    
    // DEBUG: Uncomment below to test Sunday view manually
    // const dayName = "Sunday"; 

    setCurrentDay(dayName);

    if (dayName === "Sunday") {
      setIsSunday(true);
      // On Sunday, show all of Monday's classes in the swipe list
      setRemainingClasses(timetableData["Monday"]);
    } else {
      const todaySchedule = timetableData[dayName] || [];
      determineNextClass(todaySchedule);
    }
  }, []);

  const determineNextClass = (schedule) => {
    const now = new Date();
    // DEBUG: Uncomment below to test specific time (e.g. 9:00 AM)
    // now.setHours(9, 0, 0); 

    let upcoming = null;
    let others = [];

    // Helper to parse "8:15 AM" into a Date object for today
    const parseTime = (timeStr) => {
      const [start] = timeStr.split("-"); // Extract start time
      return parse(start.trim(), "h:mm a", new Date());
    };

    // Find classes starting after right now
    const futureClasses = schedule.filter((cls) => {
      const classStartTime = parseTime(cls.time);
      return isAfter(classStartTime, now);
    });

    if (futureClasses.length > 0) {
      // The very next class goes to the top card
      upcoming = futureClasses[0];
      // All subsequent classes go to the swipe list
      others = futureClasses.slice(1); 
    } else {
      upcoming = null;
      others = [];
    }

    setNextClass(upcoming);
    setRemainingClasses(others);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 text-gray-800 font-sans">
      
      {/* Header */}
      <header className="w-full max-w-sm mb-6 mt-2 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {isSunday ? "Sunday" : currentDay}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {format(new Date(), "MMMM do")}
          </p>
        </div>
        <div className="bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
             <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {isSunday ? "Weekend" : "Today"}
             </span>
        </div>
      </header>

      {/* TOP CARD: Highlight / Next Class */}
      <div className="w-full max-w-sm mb-8 z-10">
        {isSunday ? (
          // SUNDAY CARD
          <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl shadow-2xl p-6 text-white transform transition hover:scale-[1.02]">
            <div className="flex items-center mb-4">
               <span className="text-4xl mr-3">😎</span>
               <div>
                  <h2 className="text-2xl font-bold leading-none">Relax!</h2>
                  <p className="text-green-100 text-sm">It's Sunday.</p>
               </div>
            </div>
            <p className="text-green-50 opacity-90 text-sm leading-relaxed">
              No classes today. Take a break. Monday's schedule is prepared below for you to check.
            </p>
          </div>
        ) : nextClass ? (
          // NEXT CLASS CARD
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-2xl p-6 text-white relative overflow-hidden">
             {/* Decorative circle */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>

            <p className="text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2">Up Next</p>
            
            <h2 className="text-2xl font-bold mb-1 leading-tight">
                {nextClass.subject.split("-").pop().trim()}
            </h2>
            <p className="text-xs text-indigo-100 mb-6 opacity-80">{nextClass.subject}</p>
            
            <div className="flex justify-between items-end border-t border-white/20 pt-4">
              <div>
                <div className="flex items-center text-indigo-100 text-xs mb-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Time
                </div>
                <p className="font-semibold text-lg">{nextClass.time}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end text-indigo-100 text-xs mb-1">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Room
                </div>
                <p className="font-semibold text-lg">{nextClass.location}</p>
              </div>
            </div>
          </div>
        ) : (
          // NO MORE CLASSES
          <div className="bg-white rounded-3xl shadow-lg p-8 text-center border border-gray-100">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-800">All Done!</h3>
            <p className="text-gray-500 mt-2">No more classes scheduled for today.</p>
          </div>
        )}
      </div>

      {/* SWIPE SECTION */}
      <div className="w-full max-w-sm flex-1 flex flex-col">
        <h3 className="text-md font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">
          {isSunday ? "Monday's Plan" : "Coming Up"}
        </h3>

        {remainingClasses.length > 0 ? (
          <div className="flex-1 h-[340px]">
            <Swiper
              effect={"cards"}
              grabCursor={true}
              modules={[EffectCards]}
              className="mySwiper w-full h-full"
            >
              {remainingClasses.map((cls, index) => (
                <SwiperSlide key={index} className="rounded-2xl shadow-sm">
                  <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex flex-col relative">
                    
                    {/* Index Badge */}
                    <div className="absolute top-4 right-4 bg-gray-100 text-gray-400 text-xs font-bold px-2 py-1 rounded-md">
                        #{index + 1}
                    </div>

                    <div className="mt-2">
                        <span className="inline-block bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2">
                            {cls.total_hours}
                        </span>
                        <h4 className="text-xl font-bold text-gray-800 leading-snug">
                            {cls.subject}
                        </h4>
                        <p className="text-sm text-gray-400 mt-1">
                             <span className="font-semibold text-gray-600">{cls.teacher}</span>
                        </p>
                    </div>

                    <div className="mt-auto bg-gray-50 -mx-6 -mb-6 p-5 border-t border-gray-100 rounded-b-2xl">
                      <div className="flex items-center mb-2 text-gray-700">
                        <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span className="text-sm font-semibold">{cls.time}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                         <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span className="text-sm font-semibold">{cls.location}</span>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            <div className="text-center mt-4 flex justify-center items-center text-gray-400 text-xs animate-pulse">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Swipe cards to see more
            </div>
          </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-12 text-gray-300 border-2 border-dashed border-gray-200 rounded-2xl">
             <p className="text-sm font-medium">Nothing else coming up</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default App;