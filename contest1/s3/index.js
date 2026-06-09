const fs = require('fs')

fs.readFile("./users.json","utf8",  (err, data) => {
    if (err) {
        console.error("error reading");
        return;

    }
    console.log("File contents: ",data)

    const users = JSON.parse(data);

    const emails = users.map(user => user.email).join('\n');

    fs.writeFile('emails.txt', emails, 'utf8', (err) => {
        if (err) {
            console.error("Error writing file");
            return;
        }

        console.log("File written successfully");
    });
});


//Q2

fs.readFile("./marks.json", "utf8", (err,data) => {
    if (err) {
        console.error("error reading");
        return;

    }
    console.log("File contents: ",data)

    const students = JSON.parse(data);
    
    const marks = students.map(student => student.marks);

    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const average = marks.reduce((sum, mark) => sum + mark, 0) / marks.length;

    const report = `Highest: ${highest} Lowest: ${lowest} Average: ${average}`;

    fs.writeFile("report.txt", report, "utf8", (err) => {
        if (err) {
            console.error("Error writing report");
            return;
        }

        console.log("Report generated successfully!");
    });
})

//q3

fs.readFile("./events.txt", "utf8", (err,data) => {
    if (err) {
        console.error("error reading");
        return;
    }
    console.log("File contents: ",data)

    let events = data.split("\n");

    let signup = 0;
    let order = 0;
    let reset = 0;

    for (let i = 0; i < events.length; i++) {
        if (events[i] === "USER_SIGNUP") {
            signup++;
        } else if (events[i] === "ORDER_PLACED") {
            order++;
        } else if (events[i] === "PASSWORD_RESET") {
            reset++;
        }
    }

    let report =
        "USER_SIGNUP: " + signup + "\n" +
        "ORDER_PLACED: " + order + "\n" +
        "PASSWORD_RESET: " + reset;

    fs.writeFile("analytics.txt", report, (err) => {
        if (err) {
            console.log("Error writing file");
            return;
        }

        console.log("Analytics file created successfully");
    });

});