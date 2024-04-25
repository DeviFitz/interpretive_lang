const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let stack = [];
let pc = 0;

const err = (str) => {
    console.log(`\n${str} at line ${pc}`);
    process.exit(0);
};

const pop = (index = -1) => {
    if (stack.length < 1) {
        err("Error: Stack underflow");
    } else {
        return stack.splice(index, 1)[0];
    }
};

const handlePour = (message) => {
    const reversedMessage = message.split('').reverse();
    for (const char of reversedMessage) {
        stack.push(char.charCodeAt(0));
    }
    if (message.length === 0) {
        stack.push(32);
    }
};

const handlePrintStack = () => {
    const reversedStack = stack.slice().reverse(); // Create a copy of the stack and reverse it
    const stackString = reversedStack.map((charCode) => String.fromCharCode(charCode)).join("");
    const words = stackString.split(/\s+/).reverse().join(" "); // Split by spaces, reverse, and join back
    console.log(words);
};

const handleOrder = () => {
    return new Promise((resolve, reject) => {
        rl.question('Enter input: ', (input) => {
            // console.log(`Input is: ${input}`);
            for (const char of input) {
                const charCode = char.charCodeAt(0);
                stack.push(charCode);
            }
            handlePrintStack();
            resolve();
        });
    });
};

// Define a function to handle the NAME command
const handleName = async () => {
    return new Promise((resolve, reject) => {
        rl.question('Enter your input: ', (input) => {
            const words = input.split(' ').reverse().join(' '); // Reverse the order of words
            const reversedInput = words.split('').reverse().join('');
            for (const char of reversedInput) {
                const charCode = char.charCodeAt(0);
                stack.push(charCode);
            }
            resolve();
        });
    });
};


// Handle TIP command 
const handleTip = async () => {
    return new Promise((resolve, reject) => {
        rl.question('Enter the first number: ', async (input1) => {
            const num1 = parseInt(input1);
            if (!isNaN(num1)) {
                await new Promise((resolve) => setTimeout(resolve, 100)); // Wait for a brief moment
                rl.question('Enter the second number: ', (input2) => {
                    const num2 = parseInt(input2);
                    if (!isNaN(num2)) {
                        const result = num1 * num2;
                        stack.push(result); // Push the result onto the stack
                        resolve(); // Resolve the promise after the result is pushed
                    } else {
                        console.log("Error: Invalid input.");
                        rl.close();
                        reject();
                    }
                });
            } else {
                console.log("Error: Invalid input.");
                rl.close();
                reject();
            }
        });
    });
};






//handing repeater functionality
const handleRepeat = async () => {
    if (stack.length < 2) { // Ensure at least two elements on the stack
        err("Error: Insufficient elements in stack for REPEAT command");
        return;
    }
    const repeatCount = pop(); // Pop the repeat count first
    const repeatChar = String.fromCharCode(pop()); // Pop the character code next
    if (repeatCount === 0) {
        return; // If repeat count is 0, no need to repeat, just return
    }
    if (isNaN(repeatCount) || repeatCount < 0) {
        err("Error: Invalid repeat count");
        return;
    }
    const repeatedString = repeatChar.repeat(repeatCount);
    for (const char of repeatedString) {
        stack.push(char.charCodeAt(0));
    }
};

// Define a function to handle the ASK command
const handleAsk = async () => {
    return new Promise((resolve, reject) => {
        rl.question('Enter a single character: ', (input) => {
            if (input.length !== 1) {
                console.log("Error: You must enter a single character.");
                rl.close();
                reject();
            } else {
                const charCode = input.charCodeAt(0);
                stack.push(charCode);
                rl.question('Enter repeat count: ', (count) => {
                    if (!isNaN(count) && count >= 0) {
                        stack.push(parseInt(count));
                        resolve();
                    } else {
                        console.log("Error: Invalid repeat count.");
                        rl.close();
                        reject();
                    }
                });
            }
        });
    });
};

const interpret = async () => {
    const fileName = process.argv[2];
    try {
        const lines = fs.readFileSync(fileName, 'utf8').split('\r\n');
        while (pc >= 0 && pc < lines.length) {
            const parts = lines[pc].split(" ");
            const instr = parts[0];
            pc += 1;

            switch (instr) {
                case "DECAF":
                    stack.push(0);
                    break;
                case "FRAP":
                    if (stack.length > 0) {
                        const value = stack[stack.length - 1];
                        stack.push(value);
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "EXTRA_SHOT":
                    if (stack.length > 0) {
                        const value = pop();
                        stack.push(value + 1);
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "MOCHA":                    
                    if (stack.length > 1) {
                        const a = pop();
                        const b = pop();
                        stack.push(b * a);
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "ORDER":
                    await handleOrder();
                    break;
                case "POUR":
                    handlePour(parts.slice(1).join(' '));
                    break;
                case "GREETINGS":
                    // console.log("helloworld");
                    break;
                case "READY":
                    if (stack.length > 0) {
                        console.log(String.fromCharCode(pop()));
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "COST":
                    if (stack.length > 0) {
                        console.log(pop());
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "LATTE":
                    if (stack.length > 0) {
                        const n = pop();
                        if (n === 0) {
                            pc = parseInt(parts[1]) - 1;
                        }
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "COLD_FOAM":
                    if (stack.length > 0) {
                        const value = stack.pop();
                        stack.unshift(value);
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "SHAKEN_ESPRESSO":
                    if (stack.length > 0) {
                        const value = stack.shift();
                        stack.push(value);
                    } else {
                        err("Error: Stack underflow");
                    }
                    break;
                case "FULL_ORDER":
                    handlePrintStack();
                    break;
                //handling repeater fucntionality
                case "REPEAT":
                    handleRepeat();
                    break;
                case "TIP":
                    await handleTip();
                    break;
                case "ASK":
                    await handleAsk();
                    break;
                case "NAME":
                    await handleName();
                    break;
                case "BLACK":
                    process.exit(0);
                    break;
                default:
                    console.log("Invalid instruction:", instr);
                    process.exit(1);
            }
        }
    } catch (error) {
        console.log("Error while opening file:\n", error);
        process.exit(0);
    }
};

// Call the interpret function
interpret();
