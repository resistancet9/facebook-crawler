import React, { Component } from 'react';
import request from 'superagent';

var pages = ["meawwcom"];

class App extends Component {
  constructor(props) {
    super(props);
    var token = localStorage.getItem("i-token") || "nill";
    this.state = { token: token, clicked: false, url: pages[0], time: "00:00" ,ttime: "00:00", date: (new Date().getFullYear()) + (((new Date().getMonth()) + 1) < 10 ? '-0' : '-') + ((new Date().getMonth()) + 1) + ((new Date().getDate()) < 10 ? '-0' : '-') + (new Date().getDate()), tdate: (new Date().getFullYear()) + (((new Date().getMonth()) + 1) < 10 ? '-0' : '-') + ((new Date().getMonth()) + 1) + ((new Date().getDate()) < 10 ? '-0' : '-') + (new Date().getDate())};

    this.handleurl = this.handleurl.bind(this);
    this.handletime = this.handletime.bind(this);
    this.handlettime = this.handlettime.bind(this);
    this.handledate = this.handledate.bind(this);
    this.handletdate = this.handletdate.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleurl(event) {
    this.setState({ url: event.target.value });
  }

  handletime(event) {
    this.setState({ time: event.target.value });
  }

  handlettime(event) {
    this.setState({ ttime: event.target.value });
  }

  handledate(event) {
    this.setState({ date: event.target.value });
  }

  handletdate(event) {
    this.setState({ tdate: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({clicked: true, token: localStorage.getItem("i-token")})
    request
      .get('http://localhost:3000/api/getpost/' + this.state.url + "/" + this.state.date + "/" + this.state.tdate + "/" + this.state.time + "/" + this.state.ttime + "/" + this.state.token)
      .then((res)=>{
          if(!res.body.code){
            this.setState({resp: res.body, clicked: false})
          } 
          
          if(res.body.code){ 
            this.setState({clicked: false})
            if(res.body.code === 190463){
              var newToken = prompt(res.body.message + " Add new Token and try again: ")
              localStorage.setItem('i-token', newToken);
            } else if(res.body.code === 190){
              var newToken = prompt(res.body.message + " Add new Token and try again: ")
              localStorage.setItem('i-token', newToken);
            } else {
              alert(res.body.message)
            }
          }
      })
      .catch(e=>{
          console.log(e);
      });
  }

  getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2];
    }
    else {
        return null;
    }
  }

  render() {
    if(pages){
        var AllPages = pages.map((page,i)=>{
            return(
                <option key={i} value={page}>{page}</option>
            )
        })
    }
    if(this.state.resp){
        let data = this.state.resp;
        var Whole = data.map((o, i)=>{
            var date = o.created_time.substr(0, 19).split("T");
            var localdate = date[0].split('-')
            localdate = localdate[2] + "/" + localdate[1] + "/" + localdate[0];
            var link = o.link || "";
            var p_link = o.permalink_url || "";
            return(
                <tr className="singleone" key={i}>
                    <td>{i+1}</td> 
                    <td>{o.comment}</td> 
                    <td>{localdate + " " + date[1]}</td> 
                    <td><a href= {o.link}>{this.getHostName(link)}</a></td> 
                    <td><a href= {p_link}>{this.getHostName(p_link)}</a></td> 
                    <td>{o.reactions}</td> 
                    <td>{o.shares}</td> 
                    <td>{o.tag}</td> 
                    <td>{o.type}</td> 
                </tr>
            )
        })
    }
    return (
      <div className="App">
        <form onSubmit={this.handleSubmit}>
          &nbsp;<b>Page:</b> <select value={this.state.url} onChange={this.handleurl}>
            {AllPages}
          </select>
          &nbsp;<b>FromTime:</b> <input required name="time" type="time" value={this.state.time} onChange={this.handletime} />
          &nbsp;<b>FromDate: </b><input required name="date" type="date" value={this.state.date} onChange={this.handledate} />
          &nbsp;<b>ToTime:</b> <input required name="ttime" type="time" value={this.state.ttime} onChange={this.handlettime} />
          &nbsp;<b>ToDate:</b> <input required name="tdate" type="date" value={this.state.tdate} onChange={this.handletdate} />
          <input required name="submit" type="submit" value="Fetch" />
          <br /><br />
        </form>
        { this.state.resp && !this.state.clicked &&
        <div className="container">
            <table style={{"width": "100%"}}>
            <thead>
            <tr>
                <th>No.</th>
                <th>Comments</th>
                <th>Time</th> 
                <th>Link</th>
                <th>P_Link</th>
                <th>Reactions</th>
                <th>Shares</th>
                <th>Tag</th>
                <th>Type</th>
            </tr>
            </thead>
            <tbody>
                {Whole}
                </tbody>
            </table>
        </div>
        }
        {this.state.clicked &&
        <div className="spinner-container">
        <div className="lds-spinner"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div></div> }
      </div>
    );
  }
}
export default App;