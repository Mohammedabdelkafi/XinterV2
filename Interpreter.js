const prompt = require("prompt-sync")({ sigint: true });
let text = prompt("Xinter ==>");

// Lexer
class Lexer {
    constructor(text) {
        this.src = text.split('');
        this.tokens = [];
        this.pos = -1;
        this.curr_char = "";
        this.digits = "1234567890";
        this.letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
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
        this.logTokens(); // Log tokens after tokenization
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

    logTokens() {
        console.log(this.tokens);
    }
}

// Parser
class Parser {
    constructor(tokens) {
        this.tokens = tokens;
        this.idx = -1;
        this.curr_tok = null;
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
    }

    parse() {
        this.expr();
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
        console.log("Result: ", result);
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
        } else if (this.curr_tok === "LPAREN") {
            this.advance();
            result = this.expr();
            if (this.curr_tok === "RPAREN") {
                this.advance();
            } else {
                throw new Error("Expected ')'");
            }
        } else {
            throw new Error("Unexpected token: " + this.curr_tok);
        }
        return result;
    }
}

let lexer = new Lexer(text);
let parser = new Parser(lexer.tokens);
