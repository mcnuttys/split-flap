const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const init = () => {
    const flap_holder = document.querySelector(".split_flap_holder")

    const text_area_dom = document.querySelector("textarea")
    const rows_dom = document.querySelector("#rows")
    const columns_dom = document.querySelector("#columns")
    const width_dom = document.querySelector("#width")
    const height_dom = document.querySelector("#height")
    const font_size_dom = document.querySelector("#font_size")
    const scroll_delay_dom = document.querySelector("#scroll_delay")
    const alphabet_dom = document.querySelector("#alphabet")

    alphabet = " etaoinshrdlcumwfgypbvkjxqzETAOINSHRDLCUMWFGYPBVKJXQZ0123456789!.,/:@"
    split_flap_display = new SplitFlapDisplay(flap_holder, alphabet.split(''), 5, 30)

    text_area_dom.addEventListener("input", () => update_text())
    const update_text = async () => {
        text = text_area_dom.value
        split_flap_display.set_display(text)
    }
    update_text()

    width_dom.addEventListener("input", () => set_flap_size())
    height_dom.addEventListener("input", () => set_flap_size())
    const set_flap_size = () => {
        const width = width_dom.value
        const height = height_dom.value

        split_flap_display.set_flap_size(width, height)
    }
    set_flap_size()

    font_size_dom.addEventListener("input", () => set_font_size())
    const set_font_size = () => {
        split_flap_display.set_font_size(font_size_dom.value)
    }
    set_font_size()

    scroll_delay_dom.addEventListener("input", () => set_scroll_delay())
    const set_scroll_delay = () => {
        split_flap_display.set_scroll_delay(scroll_delay_dom.value)
    }
    set_scroll_delay()

    alphabet_dom.addEventListener("input", () => update_alphabet())
    const update_alphabet = () => {
        alphabet = " " + alphabet_dom.value
        split_flap_display.set_alphabet(alphabet)
    }
    update_alphabet()

    rows_dom.addEventListener("input", () => update_row_columns())
    columns_dom.addEventListener("input", () => update_row_columns())
    const update_row_columns = () => {
        const rows = rows_dom.value
        const columns = columns_dom.value

        flap_holder.removeChild(split_flap_display.holder)

        split_flap_display = new SplitFlapDisplay(flap_holder, alphabet.split(''), rows, columns)
        update_text()

        set_flap_size()
        set_font_size()
        set_scroll_delay()
    }
    update_row_columns()

    update()
}
window.onload = init

let last_time = 0
const update = (tt) => {
    requestAnimationFrame(update)

    let dt = last_time - tt
    dt = Math.max(dt, (1 / 60))

    split_flap_display.update_display(tt)

    last_time = tt
}

class SplitFlapDisplay {
    text = ""
    scroll_delay = 50

    constructor(parent, alphabet, rows, columns) {
        this.alphabet = alphabet
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

    set_alphabet(alphabet) {
        this.alphabet = alphabet

        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.columns; i++) {
                this.split_flaps[j][i].set_alphabet(this.alphabet)
            }
        }
    }

    set_flap_size(width, height) {
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.columns; i++) {
                this.split_flaps[j][i].set_width_height(width, height)
            }
        }
    }

    set_font_size(font_size) {
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.columns; i++) {
                this.split_flaps[j][i].set_font_size(font_size)
            }
        }
    }

    set_scroll_delay(scroll_delay) {
        this.scroll_delay = scroll_delay
    }

    update_display(tt) {
        for (let j = 0; j < this.rows; j++) {
            for (let i = 0; i < this.columns; i++) {
                this.split_flaps[j][i].update(tt)
            }
        }
    }

    async set_display(text) {
        this.text = text

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
                if (!this.split_flaps[y] || !this.split_flaps[y][x + j])
                    continue

                let set = this.split_flaps[y][x + j].set_content(word[j])

                if (set)
                    await sleep(this.scroll_delay)
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
    content = ""
    time = 0

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

        this.set_animations()

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

    set_alphabet(alphabet) {
        this.alphabet = alphabet
        this.set_content(this.content)
    }

    set_width_height(width, height) {
        this.element.style.width = width + "px"
        this.element.style.height = height + "px"
    }

    set_font_size(font_size) {
        this.element.style.fontSize = font_size + "pt"
    }

    set_animations() {
        this.anim_top = this.anim_top_flap.flap.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: this.anim_durration, fill: "forwards" })
        this.anim_bottom = this.anim_bottom_flap.flap.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: this.anim_durration, fill: "forwards", delay: this.anim_durration })
    }

    update(tt) {
        this.time = tt

        if (this.current_index === this.target_index)
            return

        if (!(this.anim_top_finished && this.anim_bottom_finished)) {
            if ((this.anim_top.pending || this.anim_bottom.pending) && tt - this.anim_start_time >= this.anim_durration * 2) {
                this.anim_top.finish()
                this.anim_bottom.finish()

                this.anim_top_finished = true
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
        this.anim_start_time = this.time

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
        this.content = content

        let i = this.alphabet.indexOf(content)
        if (this.target_index === i)
            return false

        this.target_index = Math.max(i, 0)
        return true
    }

    set_flap_content(flap, content, side) {
        if (!content)
            return

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