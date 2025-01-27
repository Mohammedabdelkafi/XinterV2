let text = "";
let tokens = [];
let pos = -1;
let curr_char = "";
let digits = "1234567890";
function advance() {;
    curr_char=tokens[pos];
    pos+=1;
}
function tokenize() {
    while (curr_char=="") {
        if (curr_char=="+") {
            tokens.append("PLUS");
        }
        else if (curr_char=="-") {
            tokens.append("MINUS");
        }
        else if (curr_char in digits) {
            parsenum()
        }
    }

}
function parsenum() {
    num_str = "";
    if (curr_char in digits) {
        num_str+=curr_char;
        advance();
    }
    else {
        tokens.append(Number(num_str))
        advance
    }
}
