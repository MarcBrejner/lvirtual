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
    "$x":0,
    "$?":0
}

function handle_reader(r){
    if (r in registers){
        return registers[r];
    }
    return 1;
}

handle_assignment

function handle_statement(s){
    if(s.childCount == 1){
        handle_syscall(s.child(0));
    }else{
        if(s.child(1).type.toString() == ':='){
            handle_assignment(s);
        }else{
            handle_conditional(s);
        }
    }
}

function execute_statements(statements){
    statements.forEach(s => {
        switch(s.type){
            case 'statement':
                handle_statement(s);
                break;
            case ';':
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
