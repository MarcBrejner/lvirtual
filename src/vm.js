const Parser = require('tree-sitter');
const L = require('tree-sitter-l');
const fs = require('fs');
const http = require('http');
const parser = new Parser();
parser.setLanguage(L);


try{
    var sourceCode = fs.readFileSync('./test_files/example.l','utf8');
} catch (err) {
    console.error(err);
}
const tree = parser.parse(sourceCode);

memory = new Int32Array(10);
labels = {}
registers = {
    "$!":0, //PC
    "$?":0, //Bool
    "$x":0,
    "$y":0,
    "$j":0
}

function get_reader_type(reader){

    if(reader.childCount == 0){
        return '_';
    } else if(reader.child(0).type == 'assign'){
        return reader.child(0).child(0).type;
    } else {
        return reader.child(0).type;
    }
}

function handle_reader(reader){
    var reader_content = reader.text;
    var reader_type = get_reader_type(reader);
    switch(reader_type){
        case 'register':
            if (reader_content in registers){
                return registers[reader_content];
            }else{
                throw new Error("Register ",reader_content," not found")
            }
        case 'memory':
            break;//not done
        case 'constant':
            break;//not done
        case 'data':
            break;//not done
        case 'label':
            break;//not done
        case '_'://does not work with strings atm.
            return parseInt(reader_content);
    }
}

function handle_binary(v_left,oper,v_right){
    switch(oper.text){
        case '+':
            return v_left + v_right;
        case '-':
            return v_left - v_right;
        case '*':
            return v_left * v_right;
        case '/':
            return v_left / v_right;
        case '|':
            return v_left || v_right ;
        case '&':
            return v_left && v_right;
    }
    console.log(console.error("reeee"));
    throw new Error("Operator:",oper," unknown")
}

function handle_unary(oper,v){
    switch(oper.text){
        case '-':
            return -v;
        case '&':
            return 0; //Not implemented
    }
}

function handle_expression(expression){
    var numOfChildren = expression.childCount;
    switch(numOfChildren){
        case 1: // reader
            return handle_reader(expression.child(0));
        case 2: // oper, reader
            return handle_unary(expression.child(0),handle_reader(expression.child(1)));
        case 3: // reader, oper, reader
            return handle_binary(handle_reader(expression.child(0)), expression.child(1), handle_reader(expression.child(2)))
    }
}

function handle_writer(statement){
    var writer = statement.child(0).child(0).child(0);
    var expression = statement.child(2); 
    switch(writer.type){
        case 'memory':
            break;
        case 'register':
            registers[writer.text.toString()] = handle_expression(expression);
    }
}

function handle_syscall(s){
    return 0;
}

function handle_statement(statement){
    if(statement.childCount == 1){ //Syscall is the only statement which has only 1 child node
        handle_syscall(statement.child(0));
    }else{
        if(statement.child(1).type.toString() == ':='){
            handle_writer(statement);
        }else if(statement.child(1).type.toString() == '?='){
            if(registers['$?']==99){//TODO: FIX 
                handle_writer(statement);
            }
        }
    }
}


function execute_statements(statements){
    let instructions = new Array();
    let lil_pc = 0;
    for(let c_i = 0; c_i < statements.childCount; c_i++){
        var statement = statements.child(c_i);
        switch(statement.type){
            case 'label':
                labels['test'] = lil_pc;
                break;
            case 'statement':
                instructions.push(statement);
                lil_pc++;
                break;
            case ';':
                break;
            case ' ':
                break;
        }
    }   

    while(true){ //step
        console.log(JSON.stringify(registers, undefined, 2)); 
        console.log(JSON.stringify(labels, undefined, 2))
        handle_statement(instructions[registers['$!']])
        registers['$!']++;
        if(registers['$!'] >= instructions.length){
            break;
        }
    }
    console.log(JSON.stringify(registers, undefined, 2)); 
    console.log(JSON.stringify(labels, undefined, 2))
}

function execute(tree){
    if(tree.rootNode.toString().includes("ERROR")){
        console.log("Syntax Error, see parse below:");
        console.log(tree.rootNode.toString());
        return;
    }
    const declarations = tree.rootNode.childCount > 1 ? tree.rootNode.child(0) : [];
    const statements = tree.rootNode.childCount > 1 ? tree.rootNode.child(1) : tree.rootNode.child(0);

    execute_statements(statements);

    //
}
execute(tree);
//console.log(tree.rootNode.toString())