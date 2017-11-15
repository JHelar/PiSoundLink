const iterator = (arr, itemCallback) => {
    for(let i = 0; i < arr.length; i++){
        let result = itemCallback({indx: i, item: arr[i]});
        if(result) return result;
    }
    return null;
}

exports.find = (arr, func) => {
    return iterator(arr, (arrItem) => {
        if(func(arrItem.item)) return arrItem.item;
    });
} 

exports.remove = (arr, func) => {
    return iterator(arr, (arrItem) => {
        if(func(arrItem.item)) return arr.splice(arrItem.indx, 1);
    });
}

exports.extend = (source, args) => {
    for(let a in args) {
        source[a] = args[a];
    }
    return source;
}

exports.next = (arr, func) => {
    return iterator(arr, (arrItem) => {
        if(func(arrItem.item)){
            if(arr[arrItem.indx + 1]) return arr[arrItem.indx + 1];
        }
    })
}

exports.previous = (arr, func) => {
    return iterator(arr, (arrItem) => {
        if(func(arrItem.item)) {
            if((arrItem.indx - 1) > -1) return arr[arrItem.indx - 1];
        }
    })
}

exports.forEach = (arr, func) => {
    return iterator(arr, (arrItem) => func(arrItem.item));
}