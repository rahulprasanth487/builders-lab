import { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', msg: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <section id="contact">
      <div className="section-inner">
        <div className="contact-form-wrap">
          <span className="section-tag reveal-up">GET IN TOUCH</span>
          <h2 className="section-title reveal-up">Let's Build <span>Together</span></h2>
          <p className="reveal-up">Ready to take your digital presence to the next level? Drop us a line — we'd love to hear about your project.</p>
          <form id="contact-form-area">
            <div className="form-group">
              <label>YOUR NAME</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="form-group">
              <label>EMAIL ADDRESS</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hello@yourcompany.com"
              />
            </div>
            <div className="form-group">
              <label>PROJECT DETAILS</label>
              <textarea
                name="msg"
                value={formData.msg}
                onChange={handleChange}
                placeholder="Tell us about your vision..."
              ></textarea>
            </div>
            <button type="button" className="btn-submit">SEND MESSAGE 🚀</button>
          </form>
        </div>
      </div>
    </section>
  );
}
