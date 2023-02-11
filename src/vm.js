const Parser = require('tree-sitter');
const L = require('tree-sitter-l');
const fs = require('fs');
const parser = new Parser();
parser.setLanguage(L);


try{
    var sourceCode = fs.readFileSync('E:/Projects/lvirtual/test_files/example.l','utf8');
    //console.log(sourceCode)
} catch (err) {
    console.error(err);
}

const tree = parser.parse(sourceCode);
console.log(tree.rootNode.toString());
//console.log(tree.rootNode.children[0]);
registers = {
    "$!":0,
    "$?":0,
    "$x":0
}

function handle_reader(r){
    if (r in registers){
        return registers[r];
    }
    return ;
}

function handle_expression(expression){

}

function handle_writer(statement){
    var writer = statement.child(0);
    var expression = statement.child(2); 
    switch(writer.Type){
        case 'memory':
            break;
        case 'register':
            registers[writer.text.toString()] = handle_expression(expression);
    }
}

function handle_statement(statement){
    if(statement.childCount == 1){ //Syscall is the only statement which has only 1 child node
        handle_syscall(statement.child(0));
    }else{
        if(statement.child(1).type.toString() == ':='){
            handle_writer(statement);
        }else if(statement.child(1).type.toString() == '?='){
            if(registers['$?']){ 
                handle_writer(statement);
            }
        }
    }
}

function execute_statements(statements){
    statements.forEach(statement => {
        switch(statement.type){
            case 'statement':
                handle_statement(statement);
                break;
            case ';':
                registers['$!']++;
                break;
            case ' ':
                break;
            
        }
    });
}

function execute(tree){
    const declarations = tree.rootNode.childCount > 1 ? tree.rootNode.child(0) : [];
    const statements = tree.rootNode.childCount > 1 ? tree.rootNode.child(1) : tree.rootNode.child(0);

    if(declarations == []){
        for(var child_index in declarations){
            console.log(declarations[child_index]);
        }
    }

    for(let child_index = 0; child_index < statements.child(0).childCount; child_index++){
        //console.log(statements.child(0).child(child_index);  
    }

    var typetest =statements.child(0).child(1);
    console.log(typetest.type);

}

execute(tree);
