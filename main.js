flap_holder = document.querySelector("#flap_holder")

class SplitFap {
    constructor(target_index, content_array) {
        this.current_index = 0
        this.target_index = target_index
        this.content_array = content_array

        this.anim_durration = 100

        this.element = document.createElement("div")
        this.element.className = "split_flap"

        this.top_flap = new_flap(this.element, "flap_top")
        this.bottom_flap = new_flap(this.element, "flap_bottom")
        this.anim_top_flap = new_flap(this.element, "flap_top")
        this.anim_bottom_flap = new_flap(this.element, "flap_bottom")

        this.top_flap.container.innerHTML = this.content_array[this.current_index]
        this.bottom_flap.container.innerHTML = this.content_array[this.current_index]
        this.anim_top_flap.container.innerHTML = this.content_array[this.current_index]
        this.anim_bottom_flap.container.innerHTML = this.content_array[this.current_index]

        this.anim_top = this.anim_top_flap.flap.animate([{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: this.anim_durration, fill: "forwards" })
        this.anim_bottom = this.anim_bottom_flap.flap.animate([{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: this.anim_durration, fill: "forwards", delay: this.anim_durration })

        this.anim_top_finished = true
        this.anim_bottom_finished = true

        this.element.onclick = async () => {
            await this.anim_top.finished
            await this.anim_bottom.finished

            this.target_index = Math.round(Math.random() * this.content_array.length)
        }

        this.element.onmouseover = async () => {
            await this.anim_top.finished
            await this.anim_bottom.finished

            this.current_index += 1
            if (this.current_index >= this.content_array.length)
                this.current_index = 0
        }

        flap_holder.appendChild(this.element)
    }

    update(dt) {
        if (this.current_index === this.target_index)
            return

        if (!(this.anim_top_finished && this.anim_bottom_finished))
            return

        let next_index = this.current_index + 1

        if (next_index >= this.content_array.length)
            next_index = 0

        this.animate_flaps(this.content_array[this.current_index], this.content_array[next_index])
        this.current_index = next_index
    }

    async animate_flaps(start_content, end_content) {
        this.anim_top_finished = false
        this.anim_bottom_finished = false

        this.anim_bottom_flap.flap.style.transform = "scaleY(0)"

        this.anim_top_flap.container.innerHTML = start_content
        this.bottom_flap.container.innerHTML = start_content

        this.top_flap.container.innerHTML = end_content
        this.anim_bottom_flap.container.innerHTML = end_content

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
        let i = this.content_array.indexOf(content)

        if (this.target_index === i)
            return false

        this.target_index = Math.max(i, 0)
        return true
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

// str = " AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789!."
str = " etaoinshrdlcumwfgypbvkjxqzETAOINSHRDLCUMWFGYPBVKJXQZ012345679!."
arr = str.split('')
flaps = []
for (let i = 0; i < 234; i++) {
    let new_flap = new SplitFap(0, arr)

    flaps.push(new_flap)
}

let last_time = 0
const loop = (tt) => {
    requestAnimationFrame(loop)

    let dt = last_time - tt
    dt = Math.max(dt, (1 / 60))

    flaps.forEach(flap => {
        flap.update(dt)
    })
    last_time = tt
}
loop(0)

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const textarea = document.querySelector("textarea")
textarea.addEventListener("input", () => {
    update_text()
})

const update_text = async () => {
    text = textarea.value

    for (let i = 0; i < flaps.length; i++) {
        if (i <= text.length) {
            let is_set = flaps[i].set_content(text[i])

            if (is_set)
                await sleep(50)
            
        } else {
            flaps[i].set_target_index(0)
        }
    }
}

update_text()