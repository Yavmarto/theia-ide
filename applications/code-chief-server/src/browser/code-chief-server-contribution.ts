import { Command, CommandContribution, CommandRegistry} from '@theia/core/lib/common';
import { inject, injectable } from '@theia/core/shared/inversify';
import { HelloBackendWithClientService, HelloBackendService } from '../common/protocol';
import { WorkspaceService } from '@theia/workspace/lib/browser';
import { FileSearchService } from '@theia/file-search/lib/common/file-search-service';

const SayHelloViaBackendCommandWithCallBack: Command = {
    id: 'sayHelloOnBackendWithCallBack.command',
    label: 'Say hello on the backend with a callback to the client',
};

const SayHelloViaBackendCommand: Command = {
    id: 'sayHelloOnBackend.command',
    label: 'Say hello on the backend',
};

const CountFilesInWorkspaceCommand: Command = {
    id: 'countFilesInWorkspace.command',
    label: 'Count files in current workspace',
};

@injectable()
export class CodeChiefServerCommandContribution implements CommandContribution {

    constructor(
        @inject(HelloBackendWithClientService) private readonly helloBackendWithClientService: HelloBackendWithClientService,
        @inject(HelloBackendService) private readonly helloBackendService: HelloBackendService,
        @inject(WorkspaceService) private readonly workspaceService: WorkspaceService,
        @inject(FileSearchService) private readonly fileSearchService: FileSearchService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(SayHelloViaBackendCommandWithCallBack, {
            execute: () => this.helloBackendWithClientService.greet().then(r => console.log(r))
        });
        registry.registerCommand(SayHelloViaBackendCommand, {
            execute: () => this.helloBackendService.sayHelloTo('World').then(r => console.log(r))
        });
        registry.registerCommand(CountFilesInWorkspaceCommand, {
            execute: async () => {
                const roots = await this.workspaceService.roots;
                if (!roots.length) {
                    console.log('No workspace opened');
                    return;
                }
                const rootUris = roots.map(r => r.resource.toString());
                const files = await this.fileSearchService.find('**/*', {
                    rootUris,
                    useGitIgnore: true
                } as any);
                console.log(`Workspace has ${files.length} files`);
            }
        });
    }
}
