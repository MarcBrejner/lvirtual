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

var pretty_printed;
labels = {}
constants = {}
registers = {
    "$!":0, //PC
    "$?":0, //Bool
    "$x":0,
    "$y":0,
    "$j":0
}

function get_reader_type(reader){

    if(reader.child(0).type == 'assign'){
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
            if (reader_content in constants){
                return constants[reader_content];
            }else{
                throw new Error("Constant ",reader_content," not found")
            }
        case 'data':
            break;//not done
        case 'label':
            if (reader_content in labels){
                return labels[reader_content];
            }else{
                throw new Error("Label ",reader_content," not found")
            }
        case 'number'://does not work with strings atm.
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
        case '>':
            return v_left > v_right;
        case '<':
            return v_left < v_right;
        case '=':
            return v_left == v_right;
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
    if(statement.childCount == 1 && statement.text == 'syscall'){
        handle_syscall(statement.child(0));
    }else{
        if(statement.child(1).type.toString() == ':='){
            handle_writer(statement);
        }else if(statement.child(1).type.toString() == '?='){
            if(registers['$?']){//TODO: FIX 
                handle_writer(statement);
            }
        }
    }
}


function read_statements(statements){
    let instructions = new Array();
    let l_pc = 0;
    for(let c_i = 0; c_i < statements.childCount; c_i++){
        let statement = statements.child(c_i);
        switch(statement.type){
            case 'label':
                labels[statement.text] = l_pc;
                break;
            case 'statement':
                instructions.push(statement);
                l_pc++;
                break;
            case ';':
                break;
            case ' ':
                break;
        }
    }
    
    return instructions;
}

function handle_declaration(declaration){
    let type = declaration.child(0).text;
    let dec = declaration.child(1).text.split(' ');
    // console.log(type)
    // console.log(dec[0])
    // console.log(dec[1])
    if(type == 'const'){
        constants[dec[0]] = dec[1];
    }else if(type == 'data'){
        data[dec[0]] = dec[1];
    }
}

function read_declarations(declarations){
    for(let c_i = 0; c_i < declarations.childCount; c_i++){
        let declaration = declarations.child(c_i);
        switch(declaration.type){
            case 'declaration':
                handle_declaration(declaration);
                break;
            case ';':
                break;
            case ' ':
                break;
        }
    }               
}


function read_program(tree){
    if(tree.rootNode.toString().includes("ERROR")){
        console.log("Syntax Error, see parse below:");
        console.log(tree.rootNode.toString());
        return;
    }
    const declarations = tree.rootNode.childCount > 1 ? tree.rootNode.child(0) : [];
    const statements = tree.rootNode.childCount > 1 ? tree.rootNode.child(1) : tree.rootNode.child(0);
    read_declarations(declarations)
    let instructions = read_statements(statements);
    return instructions;
}

function execute_all(instructions){
    while(true){ //step
        handle_statement(instructions[registers['$!']])
        registers['$!']++;
        if(registers['$!'] >= instructions.length){
            break;
        }
    }
}

function execute_step(instructions){
        if(registers['$!'] >= instructions.length){
            console.log("EOF");
            return;
        }
        handle_statement(instructions[registers['$!']])
        registers['$!']++;
        console.log("registers: ",JSON.stringify(registers, undefined, 2)); 
        console.log("labels: ",JSON.stringify(labels, undefined, 2))

}




//var instructions = read_program(tree);
//execute_step(instructions);
console.log(tree.rootNode.child(0).child(3).text);

//console.log(JSON.stringify(registers, undefined, 2)); 
//console.log(JSON.stringify(labels, undefined, 2))
//console.log(JSON.stringify(constants, undefined, 2))
//console.log(tree.rootNode.toString())