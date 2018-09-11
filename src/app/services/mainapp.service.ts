import { Injectable, EventEmitter, Inject } from '@angular/core';

@Injectable()
export class MainService {

  //eosRateReady: EventEmitter<any> = new EventEmitter();
  eosRateReady = {};
  votesToRemove;

  WINDOW: any = window;

  eosConfig = {
    chainId: "",
    httpEndpoint: "",
    expireInSeconds: 60,
    broadcast: true,
    debug: false,
    sign: true,
    /*logger: {
      log: console.log,
      error: console.error
    }*/
  };

  constructor() {}

  setEosPrice(data){
      this.eosRateReady = data;
  }
  getEosPrice(){
      return this.eosRateReady;
  }

  sortArray(data) {
      if(!data){
        return;
      }
      let result = data.sort((a, b) => {
          return b.total_votes - a.total_votes;
      }).map((elem, index) => {
          let eos_votes = Math.floor(this.calculateEosFromVotes(elem.total_votes));
          elem.all_votes = elem.total_votes;
          elem.total_votes = Number(eos_votes).toLocaleString();
          elem.index = index + 1;
          return elem;
      });
      return result;
  }

  countRate(data, totalProducerVoteWeight){
      if(!data){
        return;
      }
      this.votesToRemove = data.reduce((acc, cur) => {
            const percentageVotes = cur.all_votes / totalProducerVoteWeight * 100;
            if (percentageVotes * 200 < 100) {
              acc += parseFloat(cur.all_votes);
            }
            return acc;
      }, 0);
      data.forEach((elem) => {
        elem.rate    = (elem.all_votes / totalProducerVoteWeight * 100).toLocaleString();
        elem.rewards = this.countRewards(elem.all_votes, elem.index, totalProducerVoteWeight);
      });
      
      return data;
  }

  countRewards(total_votes, index, totalProducerVoteWeight){
    let position = index;
    let reward = 0;
    let percentageVotesRewarded = total_votes / (totalProducerVoteWeight - this.votesToRemove) * 100;
     
     if (position < 22) {
       reward += 318;
     }
     reward += percentageVotesRewarded * 200;
     if (reward < 100) {
       reward = 0;
     }
     return Math.floor(reward).toLocaleString();
  }

  calculateEosFromVotes(votes){
      let date = +new Date() / 1000 - 946684800;
      let weight = parseInt(`${ date / (86400 * 7) }`, 10) / 52; // 86400 = seconds per day 24*3600
      return votes / (2 ** weight) / 10000;
  };
 

  getGlobalNetConfig(){
    if (!this.getCookie("netsConf")){
      this.eosConfig.chainId = "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906";
      this.eosConfig.httpEndpoint = "http://bp.cryptolions.io";
      return this.WINDOW.Eos(this.eosConfig);
    }
      let cookie = JSON.parse(this.getCookie("netsConf"));
      let net = localStorage.getItem("netName") || "mainNet";
      this.eosConfig.chainId = cookie[net].chainId;
      this.eosConfig.httpEndpoint = cookie[net].httpEndpoint;
      return this.WINDOW.Eos(this.eosConfig);
  }

  getCookie(name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
      return matches ? decodeURIComponent(matches[1]) : undefined;
  }

// end service export
}