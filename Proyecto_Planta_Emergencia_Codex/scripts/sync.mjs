import {spawnSync} from 'node:child_process';
export function syncCheckout(root,log=console.log){
 const git=(...args)=>spawnSync('git',args,{cwd:root,encoding:'utf8',timeout:120000});
 const branch=git('symbolic-ref','--short','HEAD');if(branch.status!==0)return false;
 const name=branch.stdout.trim(),status=git('status','--porcelain');
 if(status.status!==0||status.stdout.trim()){log('Actualización pendiente: hay cambios locales; se conservan intactos.');return false;}
 if(git('fetch','origin',name).status!==0){log('No se pudo consultar GitHub; se mantiene la versión local.');return false;}
 const before=git('rev-parse','HEAD').stdout.trim();
 if(git('merge','--ff-only','FETCH_HEAD').status!==0){log('Actualización pendiente: la rama requiere revisión manual.');return false;}
 const changed=before!==git('rev-parse','HEAD').stdout.trim();
 if(changed)log('Nueva versión descargada de GitHub.');
 return changed;
}
