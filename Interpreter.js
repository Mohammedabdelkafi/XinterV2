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
        this.curr_char = ++this.pos < this.src.length ? this.src[this.pos] : null;
        if (this.debug) {
            console.log(`Lexer advance: pos=${this.pos}, curr_char=${this.curr_char}`);
        }
    }

    tokenize() {
        const tokenMap = {
            "+": "PLUS", "-": "MINUS", "*": "MULTIPLY", "/": "DIVIDE",
            "=": "EQUALS", "&": "AND", "|": "OR", "!": "NOT",
            "(": "LPAREN", ")": "RPAREN"
        };
        while (this.curr_char !== null) {
            if (tokenMap[this.curr_char]) {
                this.tokens.push({ type: tokenMap[this.curr_char], value: this.curr_char });
                this.advance();
            } else if (this.curr_char === '"') {
                this.parsestring();
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
        this.tokens.push({ type: "NUMBER", value: Number(num_str) });
    }

    parsestring() {
        let str_val = "";
        this.advance(); // Skip the opening quote
        while (this.curr_char !== null && this.curr_char !== '"') {
            str_val += this.curr_char;
            this.advance();
        }
        if (this.curr_char === '"') {
            this.advance(); // Skip the closing quote
            this.tokens.push({ type: "STRING", value: str_val });
        } else {
            throw new Error("Unterminated string literal");
        }
    }

    parsevar() {
        let var_str = "";
        while (this.curr_char !== null && (this.letters + this.digits).includes(this.curr_char)) {
            var_str += this.curr_char;
            this.advance();
        }
        if (var_str === "true" || var_str === "false") {
            this.tokens.push({ type: "BOOLEAN", value: var_str === "true" });
        } else {
            this.tokens.push({ type: "IDENTIFIER", value: var_str });
        }
    }
}

class Parser {
    constructor(tokens, calcMode, debug, variables) {
        this.tokens = tokens;
        this.idx = -1;
        this.curr_tok = null;
        this.calcMode = calcMode;
        this.debug = debug;
        this.variables = variables;
        this.advance();
        this.parse();
    }

    advance() {
        this.curr_tok = ++this.idx < this.tokens.length ? this.tokens[this.idx] : null;
        if (this.debug) {
            console.log(`Parser advance: idx=${this.idx}, curr_tok=${JSON.stringify(this.curr_tok)}`);
        }
    }

    parse() {
        while (this.curr_tok !== null) {
            if (this.curr_tok.type === "IDENTIFIER") {
                if (this.tokens[this.idx + 1] && this.tokens[this.idx + 1].type === "EQUALS") {
                    this.assign();
                } else if (this.curr_tok.value === "log") {
                    this.advance();
                    this.print();
                } else {
                    this.expr();
                }
            } else {
                this.expr();
            }
        }
    }

    assign() {
        let var_name = this.curr_tok.value;
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
        while (this.curr_tok && (this.curr_tok.type === "PLUS" || this.curr_tok.type === "MINUS" || this.curr_tok.type === "AND" || this.curr_tok.type === "OR")) {
            let op = this.curr_tok.type;
            this.advance();
            if (op === "PLUS") {
                result += this.term();
            } else if (op === "MINUS") {
                result -= this.term();
            } else if (op === "AND") {
                result = result && this.term();
            } else if (op === "OR") {
                result = result || this.term();
            }
        }
        if (this.calcMode) {
            console.log("Result: ", result);
        }
        return result;
    }

    term() {
        let result = this.factor();
        while (this.curr_tok && (this.curr_tok.type === "MULTIPLY" || this.curr_tok.type === "DIVIDE")) {
            let op = this.curr_tok.type;
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
        switch (this.curr_tok.type) {
            case "NUMBER":
                result = this.curr_tok.value;
                this.advance();
                break;
            case "STRING":
                result = this.curr_tok.value;
                this.advance();
                break;
            case "BOOLEAN":
                result = this.curr_tok.value;
                this.advance();
                break;
            case "IDENTIFIER":
                if (this.curr_tok.value in this.variables) {
                    result = this.variables[this.curr_tok.value];
                    this.advance();
                } else {
                    throw new Error(`Undefined variable: ${this.curr_tok.value}`);
                }
                break;
            case "NOT":
                this.advance();
                result = !this.factor();
                break;
            case "LPAREN":
                this.advance();
                result = this.expr();
                if (this.curr_tok.type === "RPAREN") {
                    this.advance();
                } else {
                    throw new Error("Expected ')'");
                }
                break;
            default:
                throw new Error("Unexpected token: " + JSON.stringify(this.curr_tok));
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
    let variables = {};
    const commands = [];
    while (a === true) {
        let text = prompt("Xinter ==>");
        switch (text) {
            case "calc":
                calcMode = true;
                console.log("Calc mode activated");
                continue;
            case "decalc":
                calcMode = false;
                console.log("Calc mode deactivated");
                continue;
            case "dev":
                debug = true;
                console.log("Developer mode activated");
                continue;
            case "undev":
                debug = false;
                console.log("Developer mode deactivated");
                continue;
            case "run":
                console.log("Running all commands...");
                for (const cmd of commands) {
                    let lexer = new Lexer(cmd, debug);
                    let parser = new Parser(lexer.tokens, calcMode, debug, variables);
                }
                continue;
            case "exit":
                console.log("exiting");
                a = false;
                break;
            default:
                commands.push(text);
                let lexer = new Lexer(text, debug);
                let parser = new Parser(lexer.tokens, calcMode, debug, variables);
                continue;
        }
    }
}
run();
