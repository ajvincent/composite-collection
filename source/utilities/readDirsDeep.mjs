import fs from "fs/promises";
import path from "path";
/**
 * Search recursively for directories and files, optionally filtering the directories.
 *
 * @param {string}            root   The root directory to walk.
 * @param {Function<string>?} filter A callback for subdirectories:  returns true if we should not walk its contents.
 * @returns {Promise<{dirs: string[]; files: string[]}>} The results of the search.
 */
export default async function readDirsDeep(root, filter = (() => false)) {
    const dirs = [path.normalize(root)], files = [];
    for (let i = 0; i < dirs.length; i++) {
        const currentDir = dirs[i];
        const entries = await fs.readdir(currentDir, { encoding: "utf-8", withFileTypes: true });
        entries.forEach(entry => {
            if (entry.isFile()) {
                files.push(path.join(currentDir, entry.name));
            }
            else if (entry.isDirectory()) {
                const fullPath = path.join(currentDir, entry.name);
                if (!filter(fullPath))
                    dirs.push(fullPath);
            }
        });
    }
    dirs.sort();
    files.sort();
    return { dirs, files };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZERpcnNEZWVwLm1qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJlYWREaXJzRGVlcC5tdHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzdCLE9BQU8sSUFBSSxNQUFNLE1BQU0sQ0FBQztBQU94Qjs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssVUFBVSxZQUFZLENBQ3hDLElBQVksRUFDWixTQUF1QyxDQUFDLEdBQWEsRUFBRSxDQUFDLEtBQUssQ0FBQztJQUc5RCxNQUFNLElBQUksR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLEdBQWEsRUFBRSxDQUFDO0lBRTFELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzQixNQUFNLE9BQU8sR0FBRyxNQUFNLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUV4RixPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3RCLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNsQixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQy9DO2lCQUNJLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRSxFQUFFO2dCQUM1QixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO29CQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3ZCO1FBQ0gsQ0FBQyxDQUFDLENBQUM7S0FDSjtJQUVELElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNaLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztJQUNiLE9BQU8sRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFDLENBQUM7QUFDdkIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBmcyBmcm9tIFwiZnMvcHJvbWlzZXNcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5cbnR5cGUgRGlyc0FuZEZpbGVzID0ge1xuICBkaXJzOiBzdHJpbmdbXTtcbiAgZmlsZXM6IHN0cmluZ1tdO1xufVxuXG4vKipcbiAqIFNlYXJjaCByZWN1cnNpdmVseSBmb3IgZGlyZWN0b3JpZXMgYW5kIGZpbGVzLCBvcHRpb25hbGx5IGZpbHRlcmluZyB0aGUgZGlyZWN0b3JpZXMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgcm9vdCAgIFRoZSByb290IGRpcmVjdG9yeSB0byB3YWxrLlxuICogQHBhcmFtIHtGdW5jdGlvbjxzdHJpbmc+P30gZmlsdGVyIEEgY2FsbGJhY2sgZm9yIHN1YmRpcmVjdG9yaWVzOiAgcmV0dXJucyB0cnVlIGlmIHdlIHNob3VsZCBub3Qgd2FsayBpdHMgY29udGVudHMuXG4gKiBAcmV0dXJucyB7UHJvbWlzZTx7ZGlyczogc3RyaW5nW107IGZpbGVzOiBzdHJpbmdbXX0+fSBUaGUgcmVzdWx0cyBvZiB0aGUgc2VhcmNoLlxuICovXG5leHBvcnQgZGVmYXVsdCBhc3luYyBmdW5jdGlvbiByZWFkRGlyc0RlZXAoXG4gIHJvb3Q6IHN0cmluZyxcbiAgZmlsdGVyOiAoKHZhbHVlOiBzdHJpbmcpID0+IGJvb2xlYW4pID0gKCgpIDogYm9vbGVhbiA9PiBmYWxzZSlcbikgOiBQcm9taXNlPERpcnNBbmRGaWxlcz5cbntcbiAgY29uc3QgZGlycyA9IFtwYXRoLm5vcm1hbGl6ZShyb290KV0sIGZpbGVzOiBzdHJpbmdbXSA9IFtdO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGlycy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGN1cnJlbnREaXIgPSBkaXJzW2ldO1xuICAgIGNvbnN0IGVudHJpZXMgPSBhd2FpdCBmcy5yZWFkZGlyKGN1cnJlbnREaXIsIHsgZW5jb2Rpbmc6IFwidXRmLThcIiwgd2l0aEZpbGVUeXBlczogdHJ1ZX0pO1xuXG4gICAgZW50cmllcy5mb3JFYWNoKGVudHJ5ID0+IHtcbiAgICAgIGlmIChlbnRyeS5pc0ZpbGUoKSkge1xuICAgICAgICBmaWxlcy5wdXNoKHBhdGguam9pbihjdXJyZW50RGlyLCBlbnRyeS5uYW1lKSk7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChlbnRyeS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgIGNvbnN0IGZ1bGxQYXRoID0gcGF0aC5qb2luKGN1cnJlbnREaXIsIGVudHJ5Lm5hbWUpO1xuICAgICAgICBpZiAoIWZpbHRlcihmdWxsUGF0aCkpXG4gICAgICAgICAgZGlycy5wdXNoKGZ1bGxQYXRoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGRpcnMuc29ydCgpO1xuICBmaWxlcy5zb3J0KCk7XG4gIHJldHVybiB7ZGlycywgZmlsZXN9O1xufVxuIl19