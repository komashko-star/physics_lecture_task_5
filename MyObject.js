class MyObject {
    constructor(id, position, velocity, mass, radius) {
        this.id = id;
        this.DOMObject = document.getElementById(this.id);
        this.DOMObject.onclick = this.colorChange;
  
        this.position = position;
  
        this.width = radius;
        this.height = radius;
        this.DOMObject.style.height = this.height / border.y_domain * border.height + 'px';
        this.DOMObject.style.width = this.width / border.x_domain * border.width + 'px';
        this.mass = mass;
        this.x_velocity = velocity[0];
        this.y_velocity = velocity[1];
    }
    colorChange(){
        let color_index = Math.floor(Math.random() * colors.length);
        document.getElementById(this.id).style.backgroundColor = colors[color_index];
    }
    getDOMObject(){
        this.DOMObject = document.getElementById(this.id);
        return this.DOMObject;
    }
    applyForces(){
        let a_y = (-border.coefficient * this.y_velocity - this.mass * G) / this.mass;
        let a_x = (-border.coefficient * this.x_velocity) / this.mass;
        
        this.y_velocity += a_y * DELTA_T;
        this.x_velocity += a_x * DELTA_T;
    }
    move(){
        let result = this.checkCollisionWithBorder();
        if (!result){
            this.applyForces();
        }
        this.position = this.getNewPosition();

        this.updateView();
    }
    updateView() {
        let [x, y] = this.position;
        
        if (x + this.width * 1.1 >= border.x_domain) {
            let delta = border.x_domain - border.x_domain_start;
            border.x_domain_start = x;
            border.x_domain = border.x_domain_start + delta;
            border.y_domain = border.x_domain - border.x_domain_start + border.y_domain_start;
        }
        if (y + this.height * 1.1 > border.y_domain) {
            border.y_domain = y + this.height * 1.1;
            border.x_domain = border.y_domain - border.y_domain_start + border.x_domain_start;
        }
  
        border.resize();
  
        this.DOMObject.style.top = (border.y_domain - y - this.height) / border.y_domain * border.height + 'px';
        this.DOMObject.style.left = (x - border.x_domain_start) / (border.x_domain - border.x_domain_start) * border.width + 'px';
    
        this.DOMObject.style.height = this.height / border.y_domain * border.height + 'px';
        this.DOMObject.style.width = this.width / (border.x_domain - border.x_domain_start) * border.width + 'px';
  
    }
    getNewPosition() {
        return [
            this.position[0] + this.x_velocity * DELTA_T,
            this.position[1] + this.y_velocity * DELTA_T
        ];
    }
    
    checkCollisionWithBorder() {
        let new_position = this.getNewPosition();
        if (new_position[1] < 0 && this.y_velocity < 0){
            this.y_velocity *= -1;
            return true;
        }
    }
}