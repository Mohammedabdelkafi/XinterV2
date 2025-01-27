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
let lexer = new Lexer(text);
