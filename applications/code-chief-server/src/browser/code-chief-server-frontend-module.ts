import { CommandContribution} from '@theia/core';
import { RemoteConnectionProvider, ServiceConnectionProvider } from '@theia/core/lib/browser';
import { ContainerModule, injectable } from '@theia/core/shared/inversify';
import { BackendClient, HelloBackendWithClientService, HelloBackendService, HELLO_BACKEND_PATH, HELLO_BACKEND_WITH_CLIENT_PATH } from '../common/protocol';
import { CodeChiefServerCommandContribution} from './code-chief-server-contribution';

export default new ContainerModule(bind => {
    bind(CommandContribution).to(CodeChiefServerCommandContribution).inSingletonScope();
    bind(BackendClient).to(BackendClientImpl).inSingletonScope();
    bind(ServiceConnectionProvider).toSelf().inSingletonScope();

    bind(HelloBackendService).toDynamicValue(ctx => {
        const connection = ctx.container.get<ServiceConnectionProvider>(RemoteConnectionProvider);
        return connection.createProxy(HELLO_BACKEND_PATH);
    }).inSingletonScope();

    bind(HelloBackendWithClientService).toDynamicValue(ctx => {
        const connection = ctx.container.get<ServiceConnectionProvider>(RemoteConnectionProvider);
        const backendClient: BackendClient = ctx.container.get(BackendClient);
        return connection.createProxy(HELLO_BACKEND_WITH_CLIENT_PATH, backendClient);
    }).inSingletonScope();
});

@injectable()
class BackendClientImpl implements BackendClient {
    getName(): Promise<string> {
        return new Promise(resolve => resolve('Client'));
    }

}
