const prompt = require("prompt-sync")({ sigint: true });

class Lexer {
    constructor(text, debug) {
        this.src = text.split('');
        this.tokens = [];
        this.pos = -1;
        this.curr_char = "";
        this.digits = "1234567890";
        this.letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
        this.debug = debug;
        this.advance();
        this.tokenize();
    }

    advance() {
        this.pos += 1;
        if (this.pos < this.src.length) {
            this.curr_char = this.src[this.pos];
        } else {
            this.curr_char = null;
        }
        if (this.debug) {
            console.log(`Lexer advance: pos=${this.pos}, curr_char=${this.curr_char}`);
        }
    }

    tokenize() {
        while (this.curr_char !== null) {
            if (this.curr_char === "+") {
                this.tokens.push("PLUS");
                this.advance();
            } else if (this.curr_char === "-") {
                this.tokens.push("MINUS");
                this.advance();
            } else if (this.curr_char === "*") {
                this.tokens.push("MULTIPLY");
                this.advance();
            } else if (this.curr_char === "/") {
                this.tokens.push("DIVIDE");
                this.advance();
            } else if (this.curr_char === "=") {
                this.tokens.push("EQUALS");
                this.advance();
            } else if (this.curr_char === "(") {
                this.tokens.push("LPAREN");
                this.advance();
            } else if (this.curr_char === ")") {
                this.tokens.push("RPAREN");
                this.advance();
            } else if (this.curr_char === ' ') {
                this.advance(); // Skip whitespace
            } else if (this.digits.includes(this.curr_char)) {
                this.parsenum();
            } else if (this.letters.includes(this.curr_char)) {
                this.parsevar();
            } else {
                throw new Error("Unexpected character: " + this.curr_char);
            }
        }
        if (this.debug) {
            console.log(`Lexer tokens: ${JSON.stringify(this.tokens)}`);
        }
    }

    parsenum() {
        let num_str = "";
        while (this.curr_char !== null && this.digits.includes(this.curr_char)) {
            num_str += this.curr_char;
            this.advance();
        }
        this.tokens.push(Number(num_str));
    }

    parsevar() {
        let var_str = "";
        while (this.curr_char !== null && (this.letters + this.digits).includes(this.curr_char)) {
            var_str += this.curr_char;
            this.advance();
        }
        this.tokens.push(var_str);
    }
}

class Parser {
    constructor(tokens, calcMode, debug) {
        this.tokens = tokens;
        this.idx = -1;
        this.curr_tok = null;
        this.calcMode = calcMode;
        this.debug = debug;
        this.variables = {};
        this.advance();
        this.parse();
    }

    advance() {
        this.idx += 1;
        if (this.idx < this.tokens.length) {
            this.curr_tok = this.tokens[this.idx];
        } else {
            this.curr_tok = null;
        }
        if (this.debug) {
            console.log(`Parser advance: idx=${this.idx}, curr_tok=${this.curr_tok}`);
        }
    }

    parse() {
        while (this.curr_tok !== null) {
            if (this.curr_tok === "print") {
                this.advance();
                this.print();
            } else if (typeof this.curr_tok === "string" && this.tokens[this.idx + 1] === "EQUALS") {
                this.assign();
            } else {
                this.expr();
            }
        }
    }

    assign() {
        let var_name = this.curr_tok;
        this.advance(); // skip var name
        this.advance(); // skip EQUALS
        let value = this.expr();
        this.variables[var_name] = value;
        if (this.debug) {
            console.log(`Assigned: ${var_name} = ${value}`);
        }
    }

    expr() {
        let result = this.term();
        while (this.curr_tok === "PLUS" || this.curr_tok === "MINUS") {
            let op = this.curr_tok;
            this.advance();
            if (op === "PLUS") {
                result += this.term();
            } else if (op === "MINUS") {
                result -= this.term();
            }
        }
        if (this.calcMode) {
            console.log("Result: ", result);
        }
        return result;
    }

    term() {
        let result = this.factor();
        while (this.curr_tok === "MULTIPLY" || this.curr_tok === "DIVIDE") {
            let op = this.curr_tok;
            this.advance();
            if (op === "MULTIPLY") {
                result *= this.factor();
            } else if (op === "DIVIDE") {
                result /= this.factor();
            }
        }
        return result;
    }

    factor() {
        let result;
        if (typeof this.curr_tok === "number") {
            result = this.curr_tok;
            this.advance();
        } else if (typeof this.curr_tok === "string" && this.curr_tok in this.variables) {
            result = this.variables[this.curr_tok];
            this.advance();
        } else if (this.curr_tok === "LPAREN") {
            this.advance();
            result = this.expr();
            if (this.curr_tok === "RPAREN") {
                this.advance();
            } else {
                throw new Error("Expected ')'");
            }
        }
        return result;
    }

    print() {
        let value = this.expr();
        console.log(value);
    }
}

function run() {
    let a = true;
    let calcMode = false;
    let debug = false;
    const commands = [];
    while (a === true) {
        let text = prompt("Xinter ==>");
        if (text === "calc") {
            calcMode = true;
            console.log("Calc mode activated");
            continue;
        } else if (text === "decalc") {
            calcMode = false;
            console.log("Calc mode deactivated");
            continue;
        } else if (text === "dev") {
            debug = true;
            console.log("Developer mode activated");
            continue;
        } else if (text === "undev") {
            debug = false;
            console.log("Developer mode deactivated");
            continue;
        } else if (text === "run") {
            console.log("Running all commands except calc and decalc...");
            for (const cmd of commands) {
                let lexer = new Lexer(cmd, debug);
                let parser = new Parser(lexer.tokens, calcMode, debug);
            }
            continue;
        } else {
            commands.push(text);
        }
        let lexer = new Lexer(text, debug);
        let parser = new Parser(lexer.tokens, calcMode, debug);
    }
}
run();
