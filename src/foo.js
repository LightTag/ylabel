export function expensive(time) {
    debugger;
    let start = Date.now(),
        count = 0
    while (Date.now() - start < 20) count++
    return count
}
