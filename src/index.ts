import {Context, Schema, segment} from 'koishi'
import {filetypeinfo} from "magic-bytes.js";

export const name = 'img2cmd'

export interface ApiDefinition{
  command_name:string
  address:string
}

export interface Config {
  apis: ApiDefinition[]
}

export const Config: Schema<Config> = Schema.object({
  apis:Schema.array(Schema.object({
    command_name:Schema.string().description("命令名称"),
    address:Schema.string().description("API服务器的地址")
  }))
})

export function apply(ctx: Context,config:Config) {
  const logger = ctx.logger("img2cmd");
  config.apis.forEach(api=>ctx.command(api.command_name).action(async()=>{
    try{
      const response = await ctx.http.get<ArrayBuffer>(api.address,{responseType:'arraybuffer'});
      const possibleTypes = filetypeinfo(new Uint8Array(response.slice(0,100)));
      if(!possibleTypes.map( t => t.typename ).some(value=>['gif','jpg','webp'].includes(value))){
        const types = possibleTypes.map(t=>t.typename).join('/')
        return '请求接口时发生错误:希望得到图片,却得到'+(types?'未知':types)+'类型';
      }
      return segment.image(response)
    }catch (e){
      logger.error(e);
      return '请求接口时发生错误';
    }
  }))
}
