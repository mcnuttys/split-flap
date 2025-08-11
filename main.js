const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

class SplitFlapDisplay {
    constructor(parent, alphabet, rows, columns) {
        this.rows = rows
        this.columns = columns

        const holder = document.createElement("div")
        holder.className = "split_flap_holder"

        this.holder = holder
        this.row_elements = []

        this.split_flaps = []

        for (let j = 0; j < rows; j++) {
            const row_element = document.createElement("div")
            row_element.classList = "split_flap_row"
            holder.appendChild(row_element)

            this.row_elements.push(row_element)

            this.split_flaps[j] = []
            for (let i = 0; i < columns; i++) {
                const new_split_flap = new SplitFlap(row_element, alphabet)

                this.split_flaps[j][i] = new_split_flap
            }
        }

        parent.appendChild(holder)
    }

    update_display() {
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.columns; i++) {
                this.split_flaps[j][i].update()
            }
        }
    }

    async set_display(text) {
        const words = text.split(' ')
        const cursor = { row: 0, column: 0 }

        for (let i = 0; i < words.length; i++) {
            const word = words[i]

            if (cursor.column + word.length > this.columns) {
                for (let j = cursor.column; j < this.columns; j++) {
                    this.split_flaps[cursor.row][j].set_target_index(0)
                }
                cursor.row++
                cursor.column = 0
            }

            if (cursor.row >= this.rows)
                return

            let x = cursor.column
            let y = cursor.row

            for (let j = 0; j < word.length; j++) {
                let set = this.split_flaps[y][x + j].set_content(word[j])

                if (set)
                    await sleep(50)
                else
                    await sleep(10)
            }

            cursor.column += word.length + 1
        }

        for (let j = cursor.row; j < this.rows; j++) {
            for (let i = 0; i < this.columns; i++) {
                if (j === cursor.row && i < cursor.column - 1) {
                    continue
                }

                this.split_flaps[j][i].set_target_index(0)
                await sleep(10)
            }
        }
    }
}

class SplitFlap {
    constructor(parent, alphabet, target_index = 0) {
        this.current_index = 0
        this.target_index = target_index
        this.alphabet = alphabet

        this.anim_durration = 100

        this.element = document.createElement("div")
        this.element.className = "split_flap"

        this.top_flap = new_flap(this.element, "flap_top")
        this.bottom_flap = new_flap(this.element, "flap_bottom")
        this.anim_top_flap = new_flap(this.element, "flap_top")
        this.anim_bottom_flap = new_flap(this.element, "flap_bottom")

        this.set_flap_content(this.top_flap, this.alphabet[this.current_index], "top")
        this.set_flap_content(this.bottom_flap, this.alphabet[this.current_index], "bottom")
        this.set_flap_content(this.anim_top_flap, this.alphabet[this.current_index], "top")
        this.set_flap_content(this.anim_bottom_flap, this.alphabet[this.current_index], "bottom")

        this.anim_top = this.anim_top_flap.flap.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: this.anim_durration, easing: "ease-in", fill: "forwards" })
        this.anim_bottom = this.anim_bottom_flap.flap.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: this.anim_durration, fill: "forwards", delay: this.anim_durration })

        this.anim_top_finished = true
        this.anim_bottom_finished = true

        this.element.onclick = async () => {
            await this.anim_top.finished
            await this.anim_bottom.finished

            this.target_index = Math.round(Math.random() * this.alphabet.length)
        }

        this.element.onmouseover = async () => {
            await this.anim_top.finished
            await this.anim_bottom.finished

            this.current_index += 1
            if (this.current_index >= this.alphabet.length)
                this.current_index = 0
        }

        parent.appendChild(this.element)
    }

    update() {
        if (this.current_index === this.target_index)
            return

        if (!(this.anim_top_finished && this.anim_bottom_finished)) {
            if (this.anim_top.currentTime > this.duration * 2) {
                this.anim_top.cancel()
                this.anim_top_finished = true
            }

            if (this.anim_bottom.currentTime > this.duration * 2) {
                this.anim_bottom.cancel()
                this.anim_bottom_finished = true
            }

            return
        }

        let next_index = this.current_index + 1

        if (next_index >= this.alphabet.length)
            next_index = 0

        this.animate_flaps(this.alphabet[this.current_index], this.alphabet[next_index])
        this.current_index = next_index
    }

    async animate_flaps(start_content, end_content) {
        this.anim_top_finished = false
        this.anim_bottom_finished = false

        this.anim_bottom_flap.flap.style.transform = "scaleY(0)"

        this.set_flap_content(this.anim_top_flap, start_content, "top")
        this.set_flap_content(this.bottom_flap, start_content, "bottom")

        this.set_flap_content(this.top_flap, end_content, "top")
        this.set_flap_content(this.anim_bottom_flap, end_content, "bottom")

        this.anim_top.play()
        this.anim_bottom.play()

        await this.anim_top.finished
        await this.anim_bottom.finished

        this.anim_top_finished = true
        this.anim_bottom_finished = true

        this.bottom_flap.container.innerHTML = end_content
    }

    set_target_index(target_index) {
        this.target_index = target_index

        if (this.target_index >= self.content_array)
            this.target_index = 0
    }

    set_content(content) {
        let i = this.alphabet.indexOf(content)

        if (this.target_index === i)
            return false

        this.target_index = Math.max(i, 0)
        return true
    }

    set_flap_content(flap, content, side) {
        flap.container.innerHTML = content

        if (content === content.toLowerCase()) {
            flap.container.style.transform = `translateY(${side === "top" ? "43" : "-57"}%)`
        } else {
            flap.container.style.transform = `translateY(${side === "top" ? "" : "-"}50%)`
        }
    }
}

const new_flap = (parent, className) => {
    let flap = document.createElement("div")
    flap.className = className
    parent.appendChild(flap)

    let container = document.createElement("div")
    container.className = "container"
    flap.appendChild(container)

    return {
        flap: flap,
        container: container
    }
}

const flap_holder = document.querySelector(".split_flap_holder")

// str = " AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789!."
str = " etaoinshrdlcumwfgypbvkjxqzETAOINSHRDLCUMWFGYPBVKJXQZ0123456789!.,/:@"
arr = str.split('')
flaps = []
// for (let i = 0; i < 234; i++) {
//     let new_flap = new SplitFlap(flap_holder, arr)
// 
//     flaps.push(new_flap)
// }

const split_flap_display = new SplitFlapDisplay(flap_holder, arr, 5, 30)

let last_time = 0
const loop = (tt) => {
    requestAnimationFrame(loop)

    let dt = last_time - tt
    dt = Math.max(dt, (1 / 60))

    split_flap_display.update_display()

    flaps.forEach(flap => {
        flap.update(dt)
    })
    last_time = tt
}
loop(0)

const textarea = document.querySelector("textarea")
textarea.addEventListener("input", () => {
    update_text()
})

const update_text = async () => {
    text = textarea.value
    split_flap_display.set_display(text)
}

update_text()