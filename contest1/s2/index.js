//Q1

inp1= [
  { user: "A", amount: 100 },
  { user: "B", amount: 200 },
  { user: "A", amount: 50 }
]

let result = {};


for(i of inp1){
    const { user, amount } = i;
    if (result[user]) {
        result[user] += amount;
    } else {
        result[user] = amount;
    }
}
    

console.log(result)

//Q2

inp2= [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
]

obj = {} ;

for (response of inp2){
    const { id , name } = response;
    obj [ id ] = name
}

console.log(obj)


//Q3

let inp3 = { a: 0, b: null, c: "hello", d: undefined, e: 5 }

let result3 = {} ;

for(let key in inp3){
    if(inp3[key]){
        result3[key] = inp3[key]
    }
}

console.log(result3)

//Q4

let roles={ admin:["read","write"], user:["read"], staff: ["write"]}
let checkRole="user"
let action="write"

let result4 = false ;


for (let role of roles[checkRole]){
    if (role === action){
        result4 = true;
        break;
    }
}

console.log(result4)


//Q5



