const fs = require("fs");

// fs.readFile("users.json", "utf-8", (err,data) => {
//     if (err) {
//         console.error("error reading", err);
//         return;

//     }
//     console.log("File contents = " + data )
//     const users = JSON.parse(data)
    
//     const emails = users.map(user => user.email).join('\n');
    
//         fs.writeFile('emails.txt', emails, 'utf8', (err) => {
//             if (err) {
//                 console.error("Error writing file");
//                 return;
//             }
    
//             console.log("File written successfully");
//         });
// })


//q2

// fs.readFile("marks.json", "utf-8", (err, data) => {
//     if (err) {
//         console.log("error reading", err);
//         return
//     }
//     let students = JSON.parse(data)
//     let highMarks = students[0].marks 
//     let lowMarks = students[0].marks 
//     let total = 0 

//     for (let student of students) {
//         if(student.marks > highMarks) {
//             highMarks = student.marks 

//         }else if ( student.marks < lowMarks){
//             lowMarks = student.marks

//         }
//         total += student.marks
//     }
//     let average = total / students.length
//     let result = `
//     Highest : ${highMarks}
//     Lowest : ${lowMarks}
//     Average MArks : ${average}
//     `
//     fs.writeFile("report.txt", result , (err) => {
//         console.log("Written succesfully")
//     })
// })


//q3

// fs.readFile("events.txt", "utf-8", (err,data) => {
    
//     let events = data.trim().split("\r\n")
//     console.log(events)

//     let result = {}
//     for(let event of events){
//         result[event] = (result[event] || 0 ) + 1
//     }
//     let ans =""
//     for(let key in result) {
//         ans += `${key} : ${result[key]}\n`


//     }

//     fs.writeFile("analytics.txt", ans, (err) => {
//         console.log("written suc")
//     })
// })

//q4

fs.readFile("message.txt", "utf-8", (err,data) => {
    
    let upperData = data.trim().toUpperCase()
    fs.writeFile("Uppercase.txt" , upperData, err =>{
        console.log("WrittenSuccsefulllyyyy");

        fs.readFile("uppercase.txt", "utf-8", (err,data) => {
            let totalWords = data.trim().split(" ")
            let ans = `Total words : ${totalWords.length}`

            fs.writeFile("summary.txt", ans, (err) => {
                console.log("Summary wriiten succesfully")
            })
        })
    })
})



//q5

const fs = require("fs");
fs.readFile("students.json", "utf8", (err, studentData) => {
    if (err) {
        console.log(err);
        return;
    }
    const students = JSON.parse(studentData);
    fs.readFile("marks1.json", "utf8", (err, marksData) => {
        if (err) {
            console.log(err);
            return;
        }
        const marks = JSON.parse(marksData);
        let report = "";
        for (let i = 0; i < students.length; i++) {
            for (let j = 0; j < marks.length; j++) {
                if (students[i].id === marks[j].id) {
                    report += `${students[i].name} - ${marks[j].marks}\n`;
                    //adding name and marks to report variable
                    break; // break statement is used to exit the inner loop once a match is foutnd, 
                    // which can improve efficiency by avoiding unnecessary iterations through the remaining marks.
                }
            }
        }
        fs.writeFile("report.txt", report, (err) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log("Report created");
        });
    });
});