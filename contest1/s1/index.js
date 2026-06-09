const input = [[1,2,3,4], [5,6,7,8], [10,4,2,1], [1], [-10, 8]]
const output =[];

function sumELmt (input) {
    for (let x in input){
        
        sum = 0;
        for (let y in input[x]){
            if( input[x][y] < 0){
                sum=0;
                break
            }
            
            sum += input[x][y];
        }
        
        output.push(sum)
    }
    console.log(output)
}

sumELmt(input)

let a = [10, 25, 8, 99, 67];


a.sort((a, b) => b - a);

let first = a[0];
let res = null;

for (let i = 1; i < a.length; i++) {
    if (a[i] < first) {
        res = a[i];
        break;
    }
}
console.log(res );
