
let func = module.exports = {}

func.RemoveNestedArray = function xRemoveNestedArray(array) {
    let final = [];
    array.forEach((firstarr) => {
        if (firstarr != null || firstarr != undefined) {
            if (firstarr.length == undefined || firstarr == "NONE") {
                final.push(firstarr);
            } else if (firstarr.length == 0) {

            } else {
                firstarr.forEach((secondarr) => {
                    if (secondarr != null || secondarr != undefined) {
                        if (secondarr.length == undefined) {
                            final.push(secondarr);
                        } else if (secondarr.length == 0) {

                        } else {
                            if (typeof secondarr === typeof []) {
                                secondarr.forEach((thirdarr) => {
                                    final.push(thirdarr);
                                })
                            }

                        }
                    }
                })
            }
        }
    })
    return final;
}


func.RemoveDulicateFromArrayOfObjects = function RemoveDulicateFromArrayOfObjects(arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
            if (arr[i].From.getTime() === arr[j].From.getTime()) {
                arr.splice(j, 1);
                // i--;
                j--;
                // i=j-1
            }
        }
    }
    return arr
}



func.getStringOfDateTime = function getStringOfDateTime(dateTime) {
    let currentDate = new Date(dateTime);
    let CurrentDateTime =
        ((currentDate.getDate() < 10 ? "0" : "") + currentDate.getDate()) +
        "/" +
        ((currentDate.getMonth() + 1 < 10 ? "0" : "") + (currentDate.getMonth() + 1)) +
        "/" +
        currentDate.getFullYear() +
        " @ " +
        (currentDate.getHours() < 10 ? "0" : "") +
        currentDate.getHours() +
        ":" +
        (currentDate.getMinutes() < 10 ? "0" : "") +
        currentDate.getMinutes()
    // ":" +
    // currentDate.getSeconds();
    return CurrentDateTime;
}

func.getStringOfDateTimeForMulter = function getStringOfDateTimeForMulter(dateTime) {
    let currentDate = new Date(dateTime);
    let CurrentDateTime =
        ((currentDate.getDate() < 10 ? '0' : '') + currentDate.getDate()) +
        '-' +
        ((currentDate.getMonth() + 1 < 10 ? '0' : '') + (currentDate.getMonth() + 1)) +
        '-' +
        currentDate.getFullYear() +
        '_' +
        (currentDate.getHours() < 10 ? '0' : '') +
        currentDate.getHours() +
        '-' +
        (currentDate.getMinutes() < 10 ? '0' : '') +
        currentDate.getMinutes()
    // ":" +
    // currentDate.getSeconds();
    return CurrentDateTime;
}

func.getDateFormat = function getDateFormat(dateTime) {
    dateTime = new Date(dateTime)
    let date = dateTime.toDateString().split(" ")
    date.splice(0, 1)
    let joindate = date[1] + " " + date[0] + " " + date[2]
    return joindate;
}

func.getTime = function getTime(date) {

    let Time = new Date(date);
    return (
        (Time.getHours() < 10 ? "0" : "") +
        Time.getHours() +
        ":" +
        (Time.getMinutes() < 10 ? "0" : "") +
        Time.getMinutes()
    );

};



func.DetermineHourlyTimeFrameBetweenDateTimes = function DetermineHourlyTimeFrameBetweenDateTimes(from, till) {
    let dt = new Date(from)
    let fromback = new Date(fromback)
    let arr = []

    while (fromback < till) {
        dt.setHours(dt.getHours() + 1)
        arr.push({ FromDateTime: fromback, TilldateTime: dt })
        fromback = new Date(dt)
    }
    return arr
}




func.GenerateCollection = function GenerateCollection(from, till) {
    let colls = []
    while (from <= till) {
        let dateTime = require('date-and-time')
        colls.push(dateTime.format(new Date(from), 'YYYYMMDD'))
        from.setDate(from.getDate() + 1)
    }
    return colls
}



func.getDailyWiseFrame = function getDailyWiseFrame(dbName, From, Till) {
    return new Promise((resolve, reject) => {
        const shiftReporting = require('../reporting/shiftReporting');
        shiftReporting.GetShiftsBetweenDates(dbName, new Date(From), new Date(Till))
            .then((result) => {
                let frame = []
                let res = result;
                let index = 0;
                result.forEach((shift, i) => {
                    if (i == index) {
                        let obj = {}
                        let filterRes = res.filter(one => new Date(one.ShiftOf).getTime() == new Date(shift.ShiftOf).getTime())
                        filterRes.sort((a, b) => { return new Date(a.ShiftStart) - new Date(b.ShiftEnd) });
                        obj.From = new Date(filterRes[0].ShiftStart);
                        obj.Date = new Date(filterRes[0].ShiftOf);
                        // obj.Periodicity = 'Day'+(i+1)
                        obj.Till = new Date(filterRes[filterRes.length - 1].ShiftEnd);
                        frame.push(obj);
                        index = index + (filterRes.length)
                        res = res.filter(one => new Date(one.ShiftOf).getTime() !== new Date(shift.ShiftOf).getTime())
                    }

                })
                frame.forEach((one, i) => {
                    one.Periodicity = 'Day' + (i + 1)
                })
                resolve(frame)
            })
            .catch((err) => {
                reject(err);
            })

    })
}

func.getWeeklyFrame = function getWeeklyFrame(dbName, From, Till) {
    return new Promise((resolve, reject) => {
        this.getDailyWiseFrame(dbName, From, Till)
            .then((result) => {
                let res = [];
                let i = 0;

                while (i < result.length) {
                    let obj = { From: new Date(result[i].From), Periodicity: 'Week' + (res.length + 1) };
                    let j = i;

                    while (j < result.length && IsInSameWeek(new Date(obj.From), new Date(result[j].From))) {
                        obj.Till = result[j].Till;
                        j++;
                    }

                    if (obj.Till) {
                        res.push(obj);
                        i = j;
                    } else {
                        i++;
                    }
                }

                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

// func.getWeeklyFrame = function getWeeklyFrame(dbName, From, Till) {
//     return new Promise((resolve, reject) => {
//         this.getDailyWiseFrame(dbName, From, Till)
//             .then((result) => {
//                 let res = [];
//                 for (let i = 0; i < result.length; i++) {
//                     let obj = { From: new Date(result[i].From), Periodicity: 'Week' + (i + 1) }
//                     for (let j = 0; j < result.length; j++) {
//                         if (IsInSameWeek(new Date(obj.From), new Date(result[j].From))) {
//                             j = 0;
//                             obj.Till = result[j].Till;
//                             result.splice(0, 1);
//                         } else {
//                             break;
//                         }

//                     }
//                     res.push(obj);
//                 }
//                 res.forEach((one, i) => {
//                     if (one.From > one.Till) {
//                         res.splice(i, 1)
//                     }
//                 })
//                 resolve(res);
//             })
//             .catch((err) => {
//                 reject(err);
//             })
//     })


//     // let arr = []
//     // while (from < till) {
//     //     let obj = {}
//     //     obj.From = new Date(from);
//     //     from.setHours(23, 59, 59);
//     //     obj.Till = new Date(from);
//     //     from.setDate(from.getDate() + 1)
//     //     from.setHours(0, 0, 0);
//     //     arr.push(obj);
//     // }
//     // return arr;
// }

function IsInSameWeek(d1, d2) {
    let x = new Date(d1)
    let daysToSunday = 7 - x.getDay();
    x.setDate(x.getDate() + daysToSunday);
    if (x >= d2) {
        return true
    }
    return false
}

function IsInSameMonth(d1, d2) {
    let x = new Date(d1)
    let daysToMonthEnd = func.lastDateOFMonth(d1.getFullYear(), d1.getMonth()) - x.getDate();
    x.setDate(x.getDate() + daysToMonthEnd);
    if (x >= d2) {
        return true
    }
    return false
}

func.getMonthlyFrame = function getMonthlyFrame(dbName, From, Till) {
    return new Promise((resolve, reject) => {
        this.getDailyWiseFrame(dbName, new Date(From), new Date(Till))
            .then((result) => {
                let res = [];
                let j = 0;
                let monthNumber = 0;
                for (let i = 0; i < result.length; i++) {
                    let obj = { From: new Date(result[i].From), Periodicity: 'Month' + (monthNumber + 1) };
                    j = i;
                    while (j < result.length && IsInSameMonth(new Date(obj.From), new Date(result[j].From))) {
                        j++;
                    }
                    obj.Till = result[j - 1].Till;
                    res.push(obj);
                    i = j - 1;
                    monthNumber++;
                }
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};


func.lastDateOFMonth = function lastDateOFMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}


func.divideFramesByMonth = function divideFramesByMonth(From, Till) {

    From = new Date(From);
    Till = new Date(Till);

    let start = new Date(From.getFullYear(), From.getMonth(), 1);
    let end = new Date(Till.getFullYear(), Till.getMonth() + 1, 0);

    let frames = [];
    let current = new Date(start);
    let monthCounter = 1;


    while (current <= end) {
        let monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
        let monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        monthEnd.setHours(23, 59, 59, 999);
        let frameStart = monthStart < From ? From : monthStart;
        let frameEnd = monthEnd > Till ? Till : monthEnd;
        frames.push({ Month: `Month ${monthCounter}`, From: frameStart, Till: frameEnd });

        current = new Date(current.getFullYear(), current.getMonth() + 1, 1);
        monthCounter++;
    }

    return frames;
}

function formatDate(date) {
    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString().padStart(2, '0');
    let day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}
