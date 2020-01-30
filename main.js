const functions = new Map([
    [/^ *INBOX/, function (match, runner) {
        runner.holding = runner.inbox.pop();
    }],
    [/^ *OUTBOX/, function (match, runner) {
        if (!runner.holding)
            return false;
        runner.outbox.push(runner.holding);
        runner.holding = null;
    }],
    [/^ *JUMP *(\w+)/, function (match, runner) {
        let label = match[1];
        runner.pc = runner.labels.get(label);
    }],
    [/^ *JUMPZ *(\w+)/, function (match, runner) {
        if (runner.holding == 0) {
            let label = match[1];
            runner.pc = runner.labels.get(label);
        }
    }],
    [/^ *JUMPN *(\w+)/, function (match, runner) {
        if (runner.holding < 0) {
            let label = match[1];
            runner.pc = runner.labels.get(label);
        }
    }]
]);

$('#run').on("click", function () {
    let code = $('#code').val();
    let instructions = [];
    let labels = [];
    for (let line of code.split("\n")) {
        let trimmed = line.trim();
        if (trimmed.endsWith(":")) {
            labels.push(trimmed.substring(0, trimmed.length - 1));
        } else {
            let instruction = getInstructionForLine(line);
            if (instruction)
                instructions.push(instruction);
        }
    }

    let inbox = [];
    for (let line of $('#inbox').val().split("\n"))
        inbox.push(parseInt(line));

    let runner = new Runner(instructions, labels, inbox);
});

function getInstructionForLine(line) {
    for (let [key, value] of functions.entries()) {
        let match = key.exec(line);
        if (match)
            return {
                match: match,
                func: value
            };
    }
}

class Runner {
    constructor(instructions, labels, inbox) {
        this.instructions = instructions;
        this.labels = labels;
        this.inbox = inbox;

        this.holding = null;
        this.ram = [];
        this.outbox = [];
        // program counter, or current instruction
        this.pc = 0;
    }
}